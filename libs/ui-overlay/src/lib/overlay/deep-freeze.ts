export function deepFreeze<T>(value: T): T {
  if (value == null) return value;

  if (typeof value !== 'object') return value;

  // Only freeze plain JSON-like objects/arrays.
  // Framework objects (e.g. Angular TemplateRef) can have internal mutable state.
  const proto = Object.getPrototypeOf(value);
  const isPlainObject = proto === Object.prototype || proto === null;

  if (!isPlainObject && !Array.isArray(value)) {
    return value;
  }

  if (Object.isFrozen(value)) return value;

  Object.freeze(value);

  if (Array.isArray(value)) {
    for (const entry of value) {
      deepFreeze(entry);
    }

    return value;
  }

  for (const key of Object.keys(value as Record<string, unknown>)) {
    deepFreeze((value as Record<string, unknown>)[key]);
  }

  return value;
}
