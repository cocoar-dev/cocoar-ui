# @cocoar/logging-abstractions

Lightweight logging abstractions for TypeScript libraries.

## Purpose

This package provides **interfaces only** - no implementation. Libraries should depend on this package to enable logging without forcing a specific logging framework.

## Installation

```bash
npm install @cocoar/logging-abstractions
```

**Size:** ~2KB (zero runtime dependencies except tslib)

## Usage in Libraries

Libraries import only from `@cocoar/logging-abstractions`:

```typescript
import { getLoggerFor } from '@cocoar/logging-abstractions';

export class MyLibraryClass {
  private logger = getLoggerFor(this); // Extracts 'MyLibraryClass' automatically

  doWork() {
    this.logger.debug('Starting work...');
    this.logger.info('Work completed');
  }

  handleError(error: Error) {
    this.logger.error(error, 'Failed to process {action}', { action: 'work' });
  }
}
```

**Alternative forms:**

```typescript
// Using class instance (recommended)
private logger = getLoggerFor(this);

// Using class reference
private logger = getLoggerFor(MyLibraryClass);

// Using string
private logger = getLoggerFor('MyLibraryClass');

// Or just use getLogger with string
private logger = getLogger('MyLibraryClass');
```

### Key Points for Library Authors

- ✅ **DO** import from `@cocoar/logging-abstractions`
- ✅ **DO** use `getLoggerFor(this)` for automatic class name extraction
- ✅ **DO** use `getLogger('SourceName')` for explicit source names
- ✅ **DO** call logger methods normally - they're safe even if no logger configured
- ❌ **DON'T** import from `@cocoar/logging` (that's for applications)
- ❌ **DON'T** call `registerLogger()` (that's for applications)

### Behavior

- **If application configures logging:** Your logs will appear
- **If application doesn't configure logging:** Logger is a no-op (does nothing, no errors)

## Usage in Applications

Applications use `@cocoar/logging` which registers itself automatically:

```typescript
import { configureGlobalLogger } from '@cocoar/logging';
import { ConsoleSink } from '@cocoar/logging';

// Configure once at app startup
configureGlobalLogger((config) => config.minLevel('debug').writeTo(new ConsoleSink()));

// Now all libraries using getLogger() will log
```

See [`@cocoar/logging`](../logging/README.md) for full documentation.

## API

### `getLoggerFor(source: string | Function | object): ILogger`

Get a logger instance with automatic source name extraction.

- Accepts **string** (used as-is), **class reference** (extracts name), or **instance** (extracts constructor name)
- Strips leading underscores from class names (TypeScript compilation artifact)
- If application configured logging → returns real logger with source enrichment
- If no logger configured → returns `NullLogger` (no-op)

**Examples:**

```typescript
// Recommended: use instance
class UserService {
  private logger = getLoggerFor(this); // Source: 'UserService'
}

// Using class reference
private logger = getLoggerFor(UserService); // Source: 'UserService'

// Using string
private logger = getLoggerFor('UserService'); // Source: 'UserService'
```

**Returns:** `ILogger` instance

### `getLogger(source?: string): ILogger`

Get a logger instance.

- If application configured logging → returns real logger
- If no logger configured → returns `NullLogger` (no-op)

**Parameters:**

- `source` (optional) - Source context (class name, module name, etc.)

**Returns:** `ILogger` instance

### `hasLogger(): boolean`

Check if a logger is configured.

**Returns:** `true` if logger configured, `false` if using NullLogger

### `ILogger` Interface

```typescript
interface ILogger {
  fatal(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  fatal(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;

  error(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  error(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;

  warn(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  warn(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;

  info(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  info(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;

  debug(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  debug(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;

  verbose(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  verbose(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;

  enrich(properties: Record<string, any>): ILogger;
}
```

### Message Templates

Use Serilog-style message templates with `{PropertyName}` placeholders:

```typescript
logger.info('User {userId} logged in from {ipAddress}', {
  userId: 123,
  ipAddress: '192.168.1.1',
});
```

## Architecture

This package follows the .NET pattern:

- `@cocoar/logging-abstractions` = `Microsoft.Extensions.Logging.Abstractions`
- `@cocoar/logging` = `Microsoft.Extensions.Logging` + providers

Libraries depend on abstractions → applications provide implementation.

## License

See LICENSE file in repository root.
