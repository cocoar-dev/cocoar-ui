# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of `@cocoar/logging`
- Serilog-style structured logging with message templates
- `Logger` class with fluent pipeline configuration API
- `configureGlobalLogger()` for application-wide logger setup
- **Pipeline Stages:**
  - `MinimumLevel` - Filter by log level with bitmask support
  - `Enrich` - Add contextual properties to log events
  - `Filter` - Custom filtering logic
  - `Transform` - Modify events before sinks
- **Built-in Sinks:**
  - `ConsoleSink` - Browser console output with rich CSS styling, circular reference safety, and collapsible groups
  - `ObservableSink` - RxJS Observable stream for custom handling
- **Advanced Features:**
  - Message templates with property capture (`{PropertyName}`)
  - Destructuring operators (`@`, `$`)
  - Contextual logging with `forContext()`
  - Scope management with `pushProperty()` and `using()`
  - Batch processing with `WriteBatch`
  - Performance metrics tracking
- Full TypeScript support with strict type definitions
- 90 comprehensive tests covering all features

### Dependencies
- Requires `@cocoar/logging-abstractions` for interface definitions

[Unreleased]: https://github.com/cocoar-dev/cocoar-ui/tree/HEAD/src/libs/logging
