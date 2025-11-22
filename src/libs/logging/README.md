# @cocoar/logging

Structured, Serilog-style logging for TypeScript — designed for monorepos and modern frontend/backend applications.

## Important: Libraries vs Applications

- **Libraries** should depend on `@cocoar/logging-abstractions` (lightweight, ~2KB)
- **Applications** should depend on `@cocoar/logging` (full implementation)

This follows the .NET pattern:
- `@cocoar/logging-abstractions` = `Microsoft.Extensions.Logging.Abstractions`
- `@cocoar/logging` = `Microsoft.Extensions.Logging`

## Features

- **Process-wide global logger** - Shared across all packages in a monorepo (even with multiple `node_modules` trees)
- **Message templates** - Serilog-style `"User {UserId} logged in"` with structured properties
- **Pipeline architecture** - Composable stages for filtering, enrichment, and routing
- **Multiple sinks** - Console, callback subscribers, HTTP, and custom sinks
- **Async support** - Fire-and-forget by default, await for critical logs (audit trails)
- **Runtime control** - Dynamically change log levels and toggle sinks (feature flags, debug mode)
- **Low overhead** - Synchronous pipeline, minimal allocations, no dependency overhead
- **Type-safe TypeScript implementation**
- **Zero dependencies** - No RxJS, no Node-specific APIs, no DOM requirements
- **Framework-agnostic** - No Angular or Node runtime lock-in

## Installation

**For applications:**

```bash
npm install @cocoar/logging
```

**For libraries:**

```bash
npm install @cocoar/logging-abstractions
```

See [`@cocoar/logging-abstractions`](../logging-abstractions/README.md) for library usage.

## When to use @cocoar/logging

Use this library if you:

- Are building an **application** (not a reusable library)
- Work in a **monorepo** and want one shared logger across all packages
- Need **structured logs** (machine-readable) instead of just `console.log`
- Want **runtime control** over sinks and log levels (feature flags, remote config)
- Prefer a **Serilog-like** message template style in TypeScript

**If you're building a reusable library,** use [`@cocoar/logging-abstractions`](../logging-abstractions/README.md) instead.

## Quick Start (Application Setup)

Configure logging once at application startup:

```typescript
import { configureGlobalLogger } from '@cocoar/logging';
import { ConsoleSink } from '@cocoar/logging';

// Configure once at application startup
configureGlobalLogger((config) =>
  config
    .minLevel('debug')
    .writeTo(new ConsoleSink({ includeProperties: true }))
);

// Now all libraries using getLoggerFor() will log automatically
```

## Usage in Libraries

Libraries use `@cocoar/logging-abstractions`:

```typescript
import { getLoggerFor } from '@cocoar/logging-abstractions';

export class DataService {
  private logger = getLoggerFor(this); // Automatically uses 'DataService' as source
  
  async fetchData(id: number) {
    this.logger.info('Fetching data for {id}', { id });
    // ... implementation
  }
}
```

See [`@cocoar/logging-abstractions` README](../logging-abstractions/README.md) for complete library usage.

## ConsoleSink Options

The `ConsoleSink` writes logs to the browser console with CSS styling and supports several options:

```typescript
new ConsoleSink({
  includeTimestamps: true,              // Prepend ISO timestamp (default: false)
  includeProperties: true,              // Show property objects (default: false)
  restrictedToMinimumLevel: 'warn',     // Per-sink minimum level (default: none)
  useGroups: true                       // Use collapsible console.group() (default: false)
})
```

**Features:**
- ✅ **Browser-optimized CSS styling** - Distinctive colors for each log level (Fatal: red badge, Error: bold red, Warning: bold orange, Info: blue, Debug/Verbose: gray)
- ✅ **Safe for circular references** - Handles DOM nodes, self-referencing objects, and complex structures without crashing
- ✅ **Error stack traces** - Error objects are passed as separate arguments so browsers render expandable stack traces
- ✅ **Source enrichment** - Shows source logger name (e.g., `[Info]:MyService`)
- ✅ **Collapsible groups** - With `useGroups: true`, logs with properties/errors are wrapped in expandable groups for cleaner DevTools

**Example with groups:**
```typescript
configureGlobalLogger((config) =>
  config
    .minLevel('debug')
    .writeTo(new ConsoleSink({ 
      includeProperties: true,
      useGroups: true  // Large objects become collapsible
    }))
);

// Logs appear as:
// ▶ >> [Information]:UserService User logged in
//     { userId: 123, timestamp: '2025-11-22T...' }
```

## Quick Start (Recommended: Global Logger)

The recommended way to use the logger is via the global singleton pattern. This ensures all packages in your monorepo share the same logger configuration:

```typescript
import { configureGlobalLogger, getLogger, ConsoleSink } from '@cocoar/logging';

// Configure once at application startup
configureGlobalLogger((config) =>
  config
    .minLevel('debug')
    .writeTo(new ConsoleSink({ includeProperties: true }))
);

// Use anywhere in your application or in any package
const logger = getLogger('MyComponent');
logger.info('Component initialized');
```

### Why Global Logger?

In a monorepo with multiple packages, you want:
- **Single configuration point** - Configure logging once, use everywhere
- **Cross-package consistency** - All packages log with the same format
- **True singleton** - Uses `Symbol.for()` to work even if multiple versions are loaded (e.g. in monorepos with multiple `node_modules` trees)

### Global vs Direct Configuration

- Use **`configureGlobalLogger` + `getLogger()`** for most apps and monorepos.
- Use **`new LoggerConfiguration()`** when:
  - You're writing a reusable library that should not depend on the global logger, or
  - You explicitly need multiple independent pipelines (e.g. one for app logs, one for audit logs).

## Usage Patterns

### Basic Logging

```typescript
import { getLogger } from '@cocoar/logging';

const logger = getLogger();

logger.fatal('Critical system failure');
logger.error('Operation failed');
logger.warn('Deprecated API used');
logger.info('User action completed');
logger.debug('Diagnostic information');
logger.verbose('Detailed trace information');
```

### Fire-and-Forget vs Await

By default, logging is **fire-and-forget** (non-blocking) for maximum performance:

```typescript
// Fire-and-forget (default) — you can safely ignore the return value
logger.info('User action completed');
logger.debug('Processing item {ItemId}', { ItemId: 123 });
```

For **critical logs** (e.g., audit trails, compliance logs), you can **await** to ensure the log was written:

```typescript
// Await critical logs - waits for all sinks to complete
await logger.fatal('Security breach detected');
await logger.error(error, 'Payment failed for {OrderId}', { OrderId: 789 });

// Awaiting only matters if any sink is asynchronous (e.g., HttpSink)
// ConsoleSink is synchronous, so awaiting does not add delay
```

**When to await:**
- Security/audit logs that must be persisted
- Payment/financial transaction logs
- Compliance-critical events
- Before process exit (ensure logs flushed)

**When to fire-and-forget:**
- Debug/diagnostic logs
- UI interaction logs
- Performance traces
- High-frequency events

### Logger Return Type

- If **all sinks are synchronous**, `logger.info()` returns **void**
- If **any sink is asynchronous**, it returns **Promise<void>**

This allows:
- Fast fire-and-forget logging by default
- `await` for critical logs only when needed

You can safely ignore the returned Promise for non-critical logs: calling `logger.info(...)` without `await` is effectively fire-and-forget.

### Class-based Logging

```typescript
import { getLoggerFor } from '@cocoar/logging';

class UserService {
  private logger = getLoggerFor(UserService);
  
  async createUser(email: string) {
    this.logger.info('Creating user {Email}', { Email: email });
    // ...
  }
}
```

### Component Logging (Angular Example)

```typescript
import { getLogger } from '@cocoar/logging';

export class MyComponent {
  private logger = getLogger('MyComponent');
  
  ngOnInit() {
    this.logger.debug('Component initialized');
  }
}
```

### Message Templates

Use `{PropertyName}` placeholders inside message templates:

```typescript
logger.debug('Processing order {OrderId} for user {UserId}', { 
  OrderId: 789, 
  UserId: 123 
});
```

### Log Levels

**Note:** Severity uses Serilog-style bitmask hierarchy — **lower number = higher severity**.

The log levels from highest to lowest severity are:

- `fatal` - Critical system failures requiring immediate attention
- `error` - Error events that might still allow the application to continue
- `warn` - Potentially harmful situations or deprecated API usage
- `info` - Informational messages highlighting application progress
- `debug` - Detailed diagnostic information for debugging
- `verbose` - Very detailed trace information

The configured `minLevel` filters everything below it. For example, `minLevel('warn')` will only log `warn`, `error`, and `fatal` messages.

### Error Logging

Pass errors as the first argument to capture stack traces:

```typescript
try {
  // ... code
} catch (error) {
  // Overload: error(error: Error, message?: string, properties?: LogProperties)
  logger.error(error as Error, 'Failed to process {Action}', { Action: 'SaveOrder' });
}
```

### Enrichment

Add contextual properties to all log events:

```typescript
import { LoggerConfiguration, ConsoleSink } from '@cocoar/logging';

const logger = new LoggerConfiguration()
  .minLevel('info')
  .enrich({ Application: 'MyApp', Version: '1.0.0' })
  .writeTo(new ConsoleSink())
  .create();

// Or enrich per logger instance
const userLogger = logger.enrich({ UserId: 123, UserName: 'john.doe' });
userLogger.info('Action performed'); // Includes UserId and UserName
```

### Filtering

Filter log events based on custom logic:

```typescript
import { LoggerConfiguration, ConsoleSink, LogEventLevel } from '@cocoar/logging';

const logger = new LoggerConfiguration()
  .filter((event) => event.level <= LogEventLevel.warn)  // Warn and higher severity (fatal, error, warn)
  .writeTo(new ConsoleSink())
  .create();
```

**Note:** LogEventLevel uses bitwise flags where **lower numbers = higher severity** (matching Serilog's bitmask severity model):
- `fatal = 1`, `error = 3`, `warn = 7`, `info = 15`, `debug = 31`, `verbose = 63`
- Use `<=` to filter "this level and higher severity" (e.g., `<= warn` includes fatal, error, warn)
- Use `>=` to filter "this level and lower severity" (e.g., `>= warn` includes warn, info, debug, verbose)

### Multiple Sinks (Console + Callback-based ObservableSink)

Write to multiple destinations:

```typescript
import { configureGlobalLogger, ConsoleSink, ObservableSink } from '@cocoar/logging';

const observableSink = new ObservableSink();

configureGlobalLogger((config) =>
  config
    .minLevel('debug')
    .writeTo(new ConsoleSink())
    .writeTo(observableSink)
);

// Subscribe to log events with a callback
const unsubscribe = observableSink.subscribe((event) => {
  console.log('Received log:', event);
  // Send to WebSocket, devtools, remote service, etc.
});

// Later: unsubscribe when no longer needed
unsubscribe();
```

`ObservableSink` is a zero-dependency implementation of the observable pattern. It uses a simple callback-based subscription API — no RxJS required. Perfect for building custom reactive sinks (e.g., browser devtools panel, WebSocket, remote logging service).

### Advanced: Interleaved Stages and Sinks

Stages (filter, enrich) and sinks can be interleaved in any order. Each sink receives events **at its position in the pipeline** — only after preceding stages have processed them:

```typescript
import { configureGlobalLogger, ConsoleSink } from '@cocoar/logging';
import { LogEventLevel } from '@cocoar/logging';

const consoleSink = new ConsoleSink();
// HttpSink is a custom implementation (see "Custom Async Sinks" section below)
const httpSink = new HttpSink('https://logs.example.com/api');

configureGlobalLogger((config) =>
  config
    .minLevel('debug')
    .writeTo(consoleSink)  // Gets ALL debug+ events (no filtering, no enrichment)
    
    .filter(e => e.level <= LogEventLevel.error)  // Filter to errors and higher severity (fatal + error)
    .enrich({
      userAgent: navigator.userAgent,
      url: window.location.href,
      buildVersion: '1.2.3'
    })
    
    .writeTo(httpSink)  // Gets only ERRORS with client enrichment
);

logger.debug('Debug info');  // → Console only
logger.info('User action');  // → Console only
logger.warn('Warning');      // → Console only
await logger.error('Error'); // → Console (no enrichment) + HTTP (with enrichment)
```

**Key points:**
- Sinks process **in configuration order**
- Each sink receives events **after all preceding stages have processed them**
- Filtering and enrichment **only affect downstream sinks**
- Mix sync (ConsoleSink) and async (HttpSink) freely

**Use cases:**
- Local console gets everything for debugging,  
  remote server gets only errors with extra context
- Different sinks with different filtering/enrichment rules

### Advanced: Fork for Isolated Pipelines

Use `fork()` to create a **branched pipeline** that processes events independently without affecting the main pipeline:

```typescript
import { configureGlobalLogger, ConsoleSink } from '@cocoar/logging';
import { LogEventLevel } from '@cocoar/logging';

const consoleSink = new ConsoleSink();
// HttpSink and AuditSink are custom implementations (see "Custom Async Sinks" section below)
const httpSink = new HttpSink('https://logs.example.com/api');
const auditSink = new AuditSink();

configureGlobalLogger((config) =>
  config
    .minLevel('debug')
    .writeTo(consoleSink)  // Gets ALL debug+ events
    
    .fork(p => p
      .filter(e => e.level <= LogEventLevel.error)  // Filter to errors and higher severity (fatal + error)
      .enrich({
        userAgent: navigator.userAgent,
        url: window.location.href,
        buildVersion: '1.2.3'
      })
      .writeTo(httpSink)  // Gets only errors with enrichment
    )
    
    .writeTo(auditSink)  // Gets ALL events, NO fork enrichment (fork is isolated)
);

logger.debug('Debug info');  // → Console + Audit (all get it)
logger.info('User action');  // → Console + Audit
await logger.error('Error'); // → Console + Audit (no enrichment) + HTTP (with enrichment)
```

**Key differences from interleaved:**
- **Fork is isolated** — filtering/enrichment inside fork doesn't affect main pipeline
- **Main pipeline continues** — sinks after fork get the original events
- **Parallel processing** — fork runs alongside main pipeline
- **Nested forks** — you can fork within a fork for complex routing

**When to use fork vs interleaving:**
- **Interleaved** (`.filter().enrich().writeTo()`) — sequential processing, each sink sees cumulative changes
- **Fork** (`.fork(p => p.filter().enrich().writeTo())`) — isolated branching, main pipeline unaffected

**Example: Multiple forks with different rules**
```typescript
configureGlobalLogger((config) =>
  config
    .minLevel('debug')
    .writeTo(consoleSink)  // All events
    
    .fork(p => p
      .filter(e => e.level <= LogEventLevel.error)
      .enrich({ destination: 'error-service' })
      .writeTo(errorServiceSink)  // Only errors (fatal + error)
    )
    
    .fork(p => p
      .filter(e => e.level <= LogEventLevel.warn)
      .enrich({ destination: 'warning-service' })
      .writeTo(warningServiceSink)  // Warnings and higher severity (fatal + error + warn)
    )
    
    .writeTo(auditSink)  // All events, no fork enrichment
);
```

### Advanced: Runtime Control of Sinks

Use predicates to enable/disable sinks dynamically at runtime — no logger reconfiguration required:

```typescript
import { configureGlobalLogger, ConsoleSink } from '@cocoar/logging';

let consoleLoggingEnabled = true;
let debugMode = false;

// Custom sink example (not included in library)
class DebugSink { /* ... */ }

configureGlobalLogger((config) =>
  config
    .minLevel('debug')
    // Console sink controlled by variable
    .writeTo(new ConsoleSink(), () => consoleLoggingEnabled)
    // Debug sink only when debug mode is on
    .writeTo(new DebugSink(), () => debugMode)
);

// Later in your code: toggle logging dynamically (cheap, no re-initialization)
consoleLoggingEnabled = false; // Disables console logging
debugMode = true;              // Enables debug sink
```

The predicate function is evaluated at runtime for each log event batch, giving you complete control without rebuilding the pipeline.

### Advanced: Runtime Control of Log Level

Control the minimum log level dynamically at runtime — no logger reconfiguration required:

```typescript
import { configureGlobalLogger, ConsoleSink, WriteLogLevel } from '@cocoar/logging';

let currentLogLevel: WriteLogLevel = 'info';

configureGlobalLogger((config) =>
  config
    .minLevel(() => currentLogLevel)  // Function evaluated at runtime
    .writeTo(new ConsoleSink())
);

// Later in your code: change level dynamically (cheap, no re-initialization)
currentLogLevel = 'debug';  // Now debug messages will be logged
currentLogLevel = 'error';  // Now only errors and fatal messages
```

This is useful for:
- Development vs production environments
- Debug mode toggles
- Feature flags
- User preferences
- Remote configuration updates

### Advanced: Custom Async Sinks with Buffering

The library doesn't include an HTTP sink out of the box, but you can easily create one with internal buffering.

**Example HttpSink implementation:**

```typescript
import { Sink, LogEvent, LogEventLevel } from '@cocoar/logging';

class HttpSink implements Sink {
  private buffer: LogEvent[] = [];
  private readonly batchSize: number;
  private readonly endpoint: string;

  constructor(endpoint: string, options = { batchSize: 10 }) {
    this.endpoint = endpoint;
    this.batchSize = options.batchSize;
  }

  async emit(events: LogEvent[]): Promise<void> {
    this.buffer.push(...events);

    // Flush when buffer reaches batch size
    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = this.buffer.splice(0, this.buffer.length);
    
    // Serialize LogEvent objects for HTTP transmission
    const payload = batch.map(event => ({
      timestamp: event.timestamp,
      level: event.level,
      message: event.message.render(event.properties, event.enrichedProperties),
      properties: event.properties,
      enrichedProperties: event.enrichedProperties,
      error: event.error ? {
        message: event.error.message,
        stack: event.error.stack
      } : null
    }));
    
    await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
}

// Usage with interleaved filtering and enrichment
configureGlobalLogger((config) =>
  config
    .minLevel('info')
    .writeTo(new ConsoleSink())  // Immediate (sync) - all logs
    
    .filter(e => e.level <= LogEventLevel.error)  // Only errors
    .enrich({ 
      environment: 'production',
      version: '1.2.3' 
    })
    
    .writeTo(new HttpSink('https://logs.example.com/api/logs', { batchSize: 20 }))  // Batched (async) - only errors with enrichment
);
```

**Key points:**
- Each sink controls its own buffering strategy
- Console logs appear immediately (sync)
- HTTP logs batch automatically (async, reduces network calls)
- `await logger.error()` waits for HTTP flush if buffer is full
- Add time-based flushing with `setInterval()` if needed
- Consider flushing on process shutdown (SIGTERM) to avoid losing buffered logs
- **Note:** You'll need to serialize `LogEvent` objects for HTTP transmission (see example above)
- **Async sinks work seamlessly with interleaving** — position them anywhere in the pipeline

## Advanced: Direct Logger Configuration

If you need fine-grained control or multiple logger instances, you can use the LoggerConfiguration directly:

```typescript
import { LoggerConfiguration, ConsoleSink } from '@cocoar/logging';

const logger = new LoggerConfiguration()
  .minLevel('debug')
  .writeTo(new ConsoleSink({ includeProperties: true }))
  .create();

logger.info('User logged in {UserId}', { UserId: 123 });
```

## Example Log Event (JSON)

When you log a message, the library creates a structured event object:

```json
{
  "timestamp": "2025-11-22T11:32:12.123Z",
  "level": "info",
  "category": "MyComponent",
  "message": "Component initialized",
  "properties": {
    "UserId": 123,
    "RequestId": "28f52df"
  }
}
```

This structured format makes logs machine-readable, queryable, and perfect for log aggregation systems.

## Architecture

The logging library uses a **pipeline architecture** with composable stages.

**Stages and sinks are interleaved** — each sink receives events at its position in the pipeline:

```
Logger.info()  →  returns void | Promise<void>
    ↓
Pipeline (synchronous array processing)
    ↓
SinkStage (sink1)     ──→  ConsoleSink (sync) emits all events
    ↓
FilterStage           ──→  (filter by level, predicates)
    ↓
EnrichStage           ──→  (add contextual properties)
    ↓
SinkStage (sink2)     ──→  HttpSink (async) emits filtered+enriched events
    ↓
FilterStage           ──→  (further filtering)
    ↓
SinkStage (sink3)     ──→  FileSink (sync) emits doubly-filtered events
```

**Components:**

1. **Logger** - Entry point for logging calls (`info`, `error`, `debug`, etc.)
   - Returns `void` if all sinks are synchronous (fire-and-forget)
   - Returns `Promise<void>` if any sink is asynchronous (awaitable)

2. **Pipeline** - Sequential processing of interleaved stages and sinks
   - Stages process events in configuration order
   - Each SinkStage emits to its sink at that point in the pipeline
   - FilterStage and EnrichStage affect only downstream sinks
   - Async sinks emit in parallel via `Promise.all()`
   - Zero dependencies (no RxJS, pure TypeScript)

3. **Stages** - Transform, filter, or route events
   - `FilterStage` - Filter events by predicate (level, custom logic)
   - `EnrichStage` - Add properties to events (creates new LogEvent objects, doesn't mutate)
   - `SinkStage` - Wraps a sink, emits events and passes them through to next stage
   - `ForkStage` - Branch pipeline for different processing (e.g. errors to separate sink)

4. **Sinks** - Output destinations (console, observables, HTTP, custom implementations)
   - Synchronous sinks (ConsoleSink, ObservableSink) return `void`
   - Asynchronous sinks (HttpSink, DatabaseSink) return `Promise<void>`
   - Each sink controls its own buffering/batching strategy
   - Each sink receives events **at its position** in the pipeline

## How it compares to other logging libraries

- **winston** — Flexible, but untyped, no message templates, heavier dependency tree
- **pino** — Extremely fast, but JSON-only and less focused on monorepos
- **tslog** — Typed, but no pipeline architecture and limited sink control
- **@cocoar/logging** — Serilog-style templates, monorepo global logger, async sinks, runtime control

## License

See the LICENSE file in the repository root.
