# Scenario Codec System

## Overview

The scenario codec system provides type-safe serialization and deserialization of component inputs for URL query parameters. This enables scenarios to accept complex types (dates, objects, arrays) while maintaining type safety between the test suite and the backstage app.

## Architecture

### Key Components

1. **ScenarioCodec Interface** - Defines how to convert between TypeScript values and URL-safe strings
2. **Default Codecs** - Built-in support for common types (Date, number, boolean, array, object, string)
3. **Format-Aware Deserialization** - Codecs inspect both TypeScript type AND actual string format
4. **Union Type Support** - Best-effort matching tries each codec until one succeeds

### Files

- `apps/showcase-e2e/src/support/scenario-codecs.ts` - Playwright test serialization
- `apps/scenar-backstage/src/app/scenario-codecs.ts` - Backstage runtime deserialization

## How It Works

### Serialization (Tests → URL)

When calling `openScenario(page, 'demo/icon', { size: 42 })`:

1. Runtime type detection (`typeof`, `instanceof`, `Array.isArray()`)
2. Find matching codec using `canSerialize(value)`
3. Call `serialize(value)` to convert to string
4. Build URL: `/__scenario/demo/icon?size=42`

**Example:**

```typescript
await openScenario(page, 'demo/codec/union-date', {
  unionValue: new Date('2025-01-15T12:00:00.000Z'), // Serializes to "2025-01-15T12:00:00.000Z"
  numberOrString: 42,                                // Serializes to "42"
  dateOrString: new Date('2025-12-31T23:59:59.999Z') // Serializes to "2025-12-31T23:59:59.999Z"
});

// URL: /__scenario/demo/codec/union-date?unionValue=2025-01-15T12:00:00.000Z&numberOrString=42&dateOrString=2025-12-31T23:59:59.999Z
```

### Deserialization (URL → Component)

When backstage app loads `/__scenario/demo/icon?size=42`:

1. Fetch metadata from `/registry.metadata.json` to get TypeScript type
2. For each query parameter, find matching codec using `canDeserialize(tsType, str)`
3. Call `deserialize(str)` to convert back to TypeScript value
4. Pass deserialized values to component as inputs

**Example:**

```typescript
// URL: ?unionValue=2025-01-15T12:00:00.000Z&numberOrString=42&dateOrString=hello

// Metadata: { tsType: "string | Date | object" }
// dateCodec.canDeserialize("string | Date | object", "2025-01-15T12:00:00.000Z")
//   → checks if string matches /^\d{4}-\d{2}-\d{2}T/ → true
// dateCodec.deserialize("2025-01-15T12:00:00.000Z") → new Date(...)

// Metadata: { tsType: "number | string" }
// numberCodec.canDeserialize("number | string", "42")
//   → checks if string matches /^-?\d+\.?\d*$/ → true
// numberCodec.deserialize("42") → 42

// Metadata: { tsType: "Date | string" }
// dateCodec.canDeserialize("Date | string", "hello")
//   → checks if string matches /^\d{4}-\d{2}-\d{2}T/ → false
// stringCodec.canDeserialize("Date | string", "hello") → true (fallback)
// stringCodec.deserialize("hello") → "hello"
```

## Format-Aware Deserialization

The key innovation is that `canDeserialize(tsType, str)` receives **both** the TypeScript type and the actual string value. This enables intelligent matching for union types.

### Why This Matters

Consider type: `string | Date | object`

**Without value inspection:** All three codecs match the type signature → ambiguous

**With value inspection:** Each codec checks the string format:
- `dateCodec`: Does it match `/^\d{4}-\d{2}-\d{2}T/`? (ISO 8601 pattern)
- `objectCodec`: Does it start with `{`? (JSON object)
- `stringCodec`: Always matches (fallback)

### Codec Logic

| Codec | Type Check | Format Check | Example Matches |
|-------|-----------|--------------|-----------------|
| `dateCodec` | `tsType.includes('Date')` | `/^\d{4}-\d{2}-\d{2}T/` | `2025-01-15T12:00:00.000Z` |
| `numberCodec` | `tsType === 'number'` | `/^-?\d+\.?\d*$/` | `42`, `-3.14` |
| `booleanCodec` | `tsType === 'boolean'` | `str === 'true' \|\| str === 'false'` | `true`, `false` |
| `arrayCodec` | `tsType.includes('[]')` | `str.startsWith('[')` | `[1,2,3]` |
| `objectCodec` | `tsType.startsWith('{')` | `str.startsWith('{')` | `{"key":"value"}` |
| `stringCodec` | Always | Always | Any string (fallback) |

## Union Type Handling

For union types like `string | Date | object`, the system:

1. Detects union by checking if `tsType` contains `|` (after stripping `undefined`/`null`)
2. Iterates through all codecs in order
3. For each codec that matches (`canDeserialize` returns true):
   - Try to deserialize
   - If successful, return result
   - If error, try next codec
4. If all codecs fail, return as string (fallback)

**Codec Order Matters!** Default order:
```typescript
[dateCodec, numberCodec, booleanCodec, arrayCodec, objectCodec, stringCodec]
```

This ensures:
- Date checked before object (both could match JSON)
- Number checked before string
- String is always last (fallback)

## Custom Codecs

You can create custom codecs for domain-specific types:

```typescript
export const colorCodec: ScenarioCodec<Color> = {
  name: 'color',

  canSerialize(value: unknown): boolean {
    return value instanceof Color;
  },

  serialize(value: Color): string {
    return value.toHex(); // "#FF5733"
  },

  canDeserialize(tsType: string, str: string): boolean {
    // Type must be Color AND string must look like hex color
    return tsType.includes('Color') && /^#[0-9A-Fa-f]{6}$/.test(str);
  },

  deserialize(str: string): Color {
    return Color.fromHex(str);
  }
};

// Usage
const codecs = [...defaultCodecs, colorCodec];
deserializeWithCodecs('#FF5733', 'Color', codecs);
```

## Testing the Codec System

The `apps/scenar-backstage/src/scenarios/codec-demo.component.scenario.ts` file demonstrates union type handling:

**Test URLs:**

- `/__scenario/demo/codec/union-date?unionValue=2025-01-15T12:00:00.000Z` → Date
- `/__scenario/demo/codec/union-date?unionValue={"key":"value"}` → Object
- `/__scenario/demo/codec/union-date?unionValue=hello` → String
- `/__scenario/demo/codec/union-date?numberOrString=42` → Number
- `/__scenario/demo/codec/union-date?numberOrString=hello` → String
- `/__scenario/demo/codec/union-date?dateOrString=2025-01-15T12:00:00.000Z` → Date
- `/__scenario/demo/codec/union-date?dateOrString=hello` → String

The component displays the deserialized type to verify correct handling.

## Edge Cases

### Empty Strings

Empty string `""` is treated as a valid string (not undefined).

### Null and Undefined

- `null` is not directly supported (no URL representation)
- `undefined` is represented by absence from URL query params
- TypeScript types like `string | undefined` are stripped to `string` for matching

### Malformed Values

If deserialization fails (e.g., invalid JSON), the system:
1. Logs warning to console
2. Falls back to returning the original string
3. Component receives string instead of intended type

### TypeScript Type Limitations

The system works with **string representations** of TypeScript types from metadata:
- Simple types: `"string"`, `"number"`, `"boolean"`, `"Date"`
- Generics: `"Array<string>"`, `"Record<string, number>"`
- Unions: `"string | Date | object"`
- Complex types: `"{key: string, value: number}"` (object literal types)

It does NOT have access to:
- Full TypeScript type information
- Interface definitions
- Type aliases
- Custom class instances (beyond Date)

## Performance Considerations

- **Metadata Fetch**: Single synchronous XHR at app startup (cached)
- **Codec Matching**: Linear search through codecs (typically 6-8 codecs)
- **Union Types**: Worst case tries all codecs, best case finds match early
- **Regex**: Simple patterns for format detection (fast)

## Future Enhancements

Potential improvements:

1. **Codec Registry**: Named registry for custom codec injection
2. **Type Hints**: Add metadata like `__type=date` to query params
3. **Binary Codecs**: Base64 encoding for buffers/blobs
4. **Custom Class Support**: Extensible serialization for domain classes
5. **Validation**: Schema validation on deserialized values
6. **Caching**: Memoize codec matching for repeated types

## References

- [ScenarioCodec Interface](../apps/showcase-e2e/src/support/scenario-codecs.ts)
- [Codec Demo Component](../apps/scenar-backstage/src/scenarios/codec-demo.component.scenario.ts)
- [Metadata JSON](../apps/scenar-backstage/public/registry.metadata.json)

---

**Version:** 1.0.0
**Last Updated:** 2025-01-15
