# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial release of `@cocoar/logging-abstractions`
- `ILogger` interface with structured logging methods (verbose, debug, info, warning, error, fatal)
- `getLogger()` and `getLoggerFor(context)` functions for retrieving global logger
- `hasLogger()` function to check if global logger is configured
- `NullLogger` implementation that discards all log events
- Zero runtime dependencies for maximum compatibility
- Full TypeScript support with strict type definitions

[Unreleased]: https://github.com/cocoar-dev/cocoar-ui/tree/HEAD/libs/logging-abstractions
