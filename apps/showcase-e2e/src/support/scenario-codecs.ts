/**
 * Codec for serializing/deserializing values for scenario URL parameters.
 * Codecs handle both runtime type detection (for serialization) and
 * TypeScript type matching (for deserialization).
 */
export interface ScenarioCodec<T = any> {
  /**
   * Unique identifier for this codec
   */
  name: string;

  /**
   * Check if this codec can serialize the given runtime value
   */
  canSerialize(value: unknown): boolean;

  /**
   * Serialize the value to a string
   */
  serialize(value: T): string;

  /**
   * Check if this codec can deserialize the given string value based on TypeScript type and value format
   * @param tsType - TypeScript type information from metadata
   * @param str - The actual string value to deserialize
   */
  canDeserialize(tsType: string, str: string): boolean;

  /**
   * Deserialize the string to the original value
   */
  deserialize(str: string): T;
}

/**
 * Codec for Date objects
 */
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
  }
};

/**
 * Codec for numbers
 */
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
    return clean === 'number' && /^-?\d+\.?\d*$/.test(str);
  },

  deserialize(str: string): number {
    const num = Number(str);
    if (isNaN(num)) {
      throw new Error(`Cannot deserialize "${str}" to number`);
    }
    return num;
  }
};

/**
 * Codec for booleans
 */
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
    return clean === 'boolean' && (str === 'true' || str === 'false');
  },

  deserialize(str: string): boolean {
    if (str === 'true') return true;
    if (str === 'false') return false;
    throw new Error(`Cannot deserialize "${str}" to boolean`);
  }
};

/**
 * Codec for arrays (JSON serialization)
 */
export const arrayCodec: ScenarioCodec<any[]> = {
  name: 'array',

  canSerialize(value: unknown): boolean {
    return Array.isArray(value);
  },

  serialize(value: any[]): string {
    return JSON.stringify(value);
  },

  canDeserialize(tsType: string, str: string): boolean {
    const clean = tsType.replace(/\s*\|\s*(undefined|null)/g, '').trim();
    // Type must be array-like AND string must start with [
    return (clean.includes('[]') || clean.includes('Array<') || clean.includes('ReadonlyArray<'))
           && str.startsWith('[');
  },

  deserialize(str: string): any[] {
    return JSON.parse(str);
  }
};

/**
 * Codec for objects (JSON serialization)
 */
export const objectCodec: ScenarioCodec<object> = {
  name: 'object',

  canSerialize(value: unknown): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
  },

  serialize(value: object): string {
    return JSON.stringify(value);
  },

  canDeserialize(tsType: string, str: string): boolean {
    const clean = tsType.replace(/\s*\|\s*(undefined|null)/g, '').trim();
    // Type must be object-like AND string must start with {
    return (clean.startsWith('{') || clean.includes('Record<') || clean.includes('interface'))
           && str.startsWith('{');
  },

  deserialize(str: string): object {
    return JSON.parse(str);
  }
};

/**
 * Codec for strings (passthrough, but checks for JSON first)
 */
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
    // Try JSON parse first (for arrays/objects serialized as strings)
    try {
      const parsed = JSON.parse(str);
      // If it parses to object/array, it should have been handled by other codecs
      // Keep as string if it's a primitive
      if (typeof parsed === 'string') return parsed;
    } catch {
      // Not JSON, keep as string
    }
    return str;
  }
};

/**
 * Default codec registry.
 * Codecs are checked in order - first match wins.
 */
export const defaultCodecs: ScenarioCodec[] = [
  dateCodec,
  booleanCodec,
  numberCodec,
  arrayCodec,
  objectCodec,
  stringCodec, // Fallback - always matches
];

/**
 * Serialize a value using the codec registry
 */
export function serializeWithCodecs(value: unknown, codecs = defaultCodecs): string {
  const codec = codecs.find(c => c.canSerialize(value));
  if (!codec) {
    // Fallback to string
    return String(value);
  }
  return codec.serialize(value);
}

/**
 * Deserialize a string using the codec registry and TypeScript type info
 */
export function deserializeWithCodecs(str: string, tsType?: string, codecs = defaultCodecs): unknown {
  if (!tsType) {
    // No type info - try JSON parse, fallback to string
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  }

  // Check if it's a union type
  const isUnion = tsType.replace(/\s*\|\s*(undefined|null)/g, '').includes('|');

  if (isUnion) {
    // For union types, try each codec that could match
    // Use best-effort: first successful deserialization wins
    for (const codec of codecs) {
      if (codec.canDeserialize(tsType, str)) {
        try {
          const result = codec.deserialize(str);
          // Successfully deserialized - use this result
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
  const codec = codecs.find(c => c.canDeserialize(tsType, str));
  if (!codec) {
    return str;
  }

  try {
    return codec.deserialize(str);
  } catch (err) {
    console.warn(`Failed to deserialize "${str}" with codec ${codec.name}:`, err);
    return str; // Fallback to string
  }
}
