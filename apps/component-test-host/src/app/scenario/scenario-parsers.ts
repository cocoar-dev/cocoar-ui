export const SCENARIO_SKIP = Symbol('SCENARIO_SKIP');

export type ScenarioSkip = typeof SCENARIO_SKIP;
export type ScenarioParserResult = unknown | ScenarioSkip;

export type ScenarioInputParser = (raw: string) => ScenarioParserResult;

export function scenarioParseBoolean(raw: string): boolean {
  const normalized = raw.trim().toLowerCase();
  if (normalized === '') return true;
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
}

export function scenarioParseString(raw: string): string {
  return raw;
}

export function scenarioParseNumber(raw: string): ScenarioParserResult {
  const normalized = raw.trim();
  if (normalized === '') return SCENARIO_SKIP;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : SCENARIO_SKIP;
}

export function scenarioParseEnum<T extends string>(
  allowed: ReadonlyArray<T>
): ScenarioInputParser {
  return (raw) => {
    return allowed.includes(raw as T) ? (raw as T) : SCENARIO_SKIP;
  };
}
