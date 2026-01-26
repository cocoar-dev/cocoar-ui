# Changelog

## [Unreleased]

### Changed
- Standardized ID generation to use `crypto.randomUUID()` across all form components
- Bumped all library versions to 0.1.0 (beta readiness milestone)
- Updated internal dependency versions for consistency

### Fixed
- Removed conflicting `"private": true` from logging libraries that have `publishConfig`
- Added missing package metadata (description, author, license, repository) to `@cocoar/data-grid` and `@cocoar/ui-menu`

## [0.0.1] - 2025-12-12

### Added
- Nx monorepo with Angular workspace (workspace root: repository root)
- Showcase app for interactive component previews
- Playwright E2E tests (`pnpm -s e2e`) with a Windows-friendly runner that starts/stops the dev server
- GitHub Actions workflows (Option C: build + pack artifacts; npm publish steps are present but commented out)
- Repository documentation (README, CONTRIBUTING, ARCHITECTURE, NAMING, AGENTS)
- `@cocoar/ui-tokens` for design tokens as CSS variables (CSS-only consumption)
- `@cocoar/ui-components` for Angular UI components
- `@cocoar/logging-abstractions` - Lightweight logging abstractions
  - `ILogger` interface with structured logging methods
  - `getLogger()`, `getLoggerFor()`, `hasLogger()` functions
  - `NullLogger` implementation
- `@cocoar/logging` - Serilog-style structured logging library
  - `Logger` with fluent pipeline configuration API
  - Pipeline stages: MinimumLevel, Enrich, Filter, Transform
  - Built-in sinks: ConsoleSink, ObservableSink
  - Message templates with property capture and destructuring
  - Contextual logging, scope management, batch processing
