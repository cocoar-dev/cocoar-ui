export interface ScenarioCodec<T = unknown> {
  name: string;
  canSerialize(value: unknown): boolean;
  serialize(value: T): string;
}

export const dateCodec: ScenarioCodec<Date> = {
  name: 'date',
  canSerialize(value: unknown): boolean {
    return value instanceof Date;
  },
  serialize(value: Date): string {
    return value.toISOString();
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
};

export const booleanCodec: ScenarioCodec<boolean> = {
  name: 'boolean',
  canSerialize(value: unknown): boolean {
    return typeof value === 'boolean';
  },
  serialize(value: boolean): string {
    return String(value);
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
};

export const objectCodec: ScenarioCodec<Record<string, unknown>> = {
  name: 'object',
  canSerialize(value: unknown): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    );
  },
  serialize(value: Record<string, unknown>): string {
    return JSON.stringify(value);
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
};

export const defaultCodecs: readonly ScenarioCodec[] = [
  dateCodec,
  booleanCodec,
  numberCodec,
  arrayCodec,
  objectCodec,
  stringCodec,
];

export function serializeWithCodecs(value: unknown, codecs = defaultCodecs): string {
  const codec = codecs.find((c) => c.canSerialize(value));
  return codec ? codec.serialize(value as never) : String(value);
}
