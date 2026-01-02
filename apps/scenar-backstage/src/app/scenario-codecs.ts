/**
 * Shared codec definitions for scenario URL parameters.
 * This file is duplicated in:
 * - apps/showcase-e2e/src/support/scenario-codecs.ts (Playwright side)
 * - apps/scenar-backstage/src/app/scenario-codecs.ts (Backstage side)
 */

/**
 * Codec for serializing/deserializing values for scenario URL parameters.
 */
export interface ScenarioCodec<T = any> {
  name: string;
  canSerialize(value: unknown): boolean;
  serialize(value: T): string;
  canDeserialize(tsType: string, str: string): boolean;
  deserialize(str: string): T;
}

export const dateCodec: ScenarioCodec<Date> = {
  name: 'date',
  canSerialize(value: unknown): boolean {
    return value instanceof Date;
  },
  serialize(value: Date): string {
    return value.toISOString();
  },
  canDeserialize(tsType: string, str: string): boolean {
    const clean = tsType.replace(/\s*\|\s*(undefined|null)/g, '').trim();
    // Type must include Date AND string must look like an ISO date
    return (clean === 'Date' || clean.includes('Date')) && /^\d{4}-\d{2}-\d{2}T/.test(str);
  },
  deserialize(str: string): Date {
    return new Date(str);
  },
};

export const numberCodec: ScenarioCodec<number> = {
  name: 'number',
  canSerialize(value: unknown): boolean {
    return typeof value === 'number';
  },
  serialize(value: number): string {
    return String(value);
  },
  canDeserialize(tsType: string, str: string): boolean {
    const clean = tsType.replace(/\s*\|\s*(undefined|null)/g, '').trim();
    // Type must be number AND string must be numeric
    return (clean === 'number' || clean.includes('number')) && /^-?\d+\.?\d*$/.test(str);
  },
  deserialize(str: string): number {
    const num = Number(str);
    if (isNaN(num)) {
      throw new Error(`Cannot deserialize "${str}" to number`);
    }
    return num;
  },
};

export const booleanCodec: ScenarioCodec<boolean> = {
  name: 'boolean',
  canSerialize(value: unknown): boolean {
    return typeof value === 'boolean';
  },
  serialize(value: boolean): string {
    return String(value);
  },
  canDeserialize(tsType: string, str: string): boolean {
    const clean = tsType.replace(/\s*\|\s*(undefined|null)/g, '').trim();
    // Type must be boolean AND string must be "true" or "false"
    return (
      (clean === 'boolean' || clean.includes('boolean')) && (str === 'true' || str === 'false')
    );
  },
  deserialize(str: string): boolean {
    if (str === 'true') return true;
    if (str === 'false') return false;
    throw new Error(`Cannot deserialize "${str}" to boolean`);
  },
};

export const arrayCodec: ScenarioCodec<unknown[]> = {
  name: 'array',
  canSerialize(value: unknown): boolean {
    return Array.isArray(value);
  },
  serialize(value: unknown[]): string {
    return JSON.stringify(value);
  },
  canDeserialize(tsType: string, str: string): boolean {
    const clean = tsType.replace(/\s*\|\s*(undefined|null)/g, '').trim();
    // Type must be array-like AND string must start with [
    return (
      (clean.includes('[]') ||
        clean.includes('Array<') ||
        clean.includes('ReadonlyArray<') ||
        clean.includes('array')) &&
      str.startsWith('[')
    );
  },
  deserialize(str: string): unknown[] {
    return JSON.parse(str);
  },
};

export const objectCodec: ScenarioCodec<object> = {
  name: 'object',
  canSerialize(value: unknown): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    );
  },
  serialize(value: object): string {
    return JSON.stringify(value);
  },
  canDeserialize(tsType: string, str: string): boolean {
    const clean = tsType.replace(/\s*\|\s*(undefined|null)/g, '').trim();
    // Type must be object-like AND string must start with {
    return (
      (clean === 'object' ||
        clean.includes('object') ||
        clean.startsWith('{') ||
        clean.includes('Record<') ||
        clean.includes('interface')) &&
      str.startsWith('{')
    );
  },
  deserialize(str: string): object {
    return JSON.parse(str);
  },
};

export const stringCodec: ScenarioCodec<string> = {
  name: 'string',
  canSerialize(value: unknown): boolean {
    return typeof value === 'string';
  },
  serialize(value: string): string {
    return value;
  },
  canDeserialize(_tsType: string, _str: string): boolean {
    // String codec is the fallback - always matches
    return true;
  },
  deserialize(str: string): string {
    return str;
  },
};

export const defaultCodecs: ScenarioCodec[] = [
  dateCodec,
  booleanCodec,
  numberCodec,
  arrayCodec,
  objectCodec,
  stringCodec,
];

export function deserializeWithCodecs(
  str: string,
  tsType?: string,
  codecs = defaultCodecs
): unknown {
  if (!tsType) {
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  }

  // Check if it's a union type (after stripping undefined/null)
  const isUnion = tsType.replace(/\s*\|\s*(undefined|null)/g, '').includes('|');

  if (isUnion) {
    // For union types, try each codec that could match
    // Use best-effort: first successful deserialization wins
    for (const codec of codecs) {
      if (codec.canDeserialize(tsType, str)) {
        try {
          const result = codec.deserialize(str);
          return result;
        } catch {
          // This codec failed, try next one
          continue;
        }
      }
    }
    // All codecs failed - return as string
    return str;
  }

  // Single type - use first matching codec
  const codec = codecs.find((c) => c.canDeserialize(tsType, str));
  if (!codec) {
    return str;
  }

  try {
    return codec.deserialize(str);
  } catch (err) {
    console.warn(`Failed to deserialize "${str}" with codec ${codec.name}:`, err);
    return str;
  }
}
