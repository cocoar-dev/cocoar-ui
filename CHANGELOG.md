# Changelog

## [Unreleased]

### Added
- Initial Nx monorepo structure
- Angular workspace configuration
- AGENTS.md and NAMING.md documentation
- GitHub Actions workflows for CI/CD
- Repository documentation (README, CONTRIBUTING, etc.)
- **[@cocoar/logging-abstractions](src/libs/logging-abstractions)** - Lightweight logging abstractions (2KB, zero dependencies)
  - `ILogger` interface with structured logging methods
  - `getLogger()`, `getLoggerFor()`, `hasLogger()` functions
  - `NullLogger` implementation
- **[@cocoar/logging](src/libs/logging)** - Serilog-style structured logging library
  - `Logger` with fluent pipeline configuration API
  - Pipeline stages: MinimumLevel, Enrich, Filter, Transform
  - Built-in sinks: ConsoleSink (with CSS styling, groups, circular safety), ObservableSink
  - Message templates with property capture and destructuring
  - Contextual logging, scope management, batch processing
  - 90 comprehensive tests
