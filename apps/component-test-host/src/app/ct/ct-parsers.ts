export const CT_SKIP = Symbol('CT_SKIP');

export type CtSkip = typeof CT_SKIP;
export type CtParserResult = unknown | CtSkip;

export type CtInputParser = (raw: string) => CtParserResult;

export function ctParseBoolean(raw: string): boolean {
  const normalized = raw.trim().toLowerCase();
  if (normalized === '') return true;
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
}

export function ctParseString(raw: string): string {
  return raw;
}

export function ctParseNumber(raw: string): CtParserResult {
  const normalized = raw.trim();
  if (normalized === '') return CT_SKIP;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : CT_SKIP;
}

export function ctParseEnum<T extends string>(allowed: ReadonlyArray<T>): CtInputParser {
  return (raw) => {
    return allowed.includes(raw as T) ? (raw as T) : CT_SKIP;
  };
}
