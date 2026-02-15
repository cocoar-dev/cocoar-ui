# Changelog

## [0.1.0] - 2026-02-15

First public release of the Cocoar Design System.

### Added
- Nx monorepo with Angular 21 workspace
- Showcase app for interactive component previews
- Playwright E2E tests with tag-based filtering (`@smoke`, `@a11y`, `@menu`, etc.)
- GitHub Actions CI workflows (build + pack artifacts)
- Repository documentation (README, CONTRIBUTING, ARCHITECTURE, NAMING)
- `@cocoar/ui` design tokens as CSS variables (CSS-only consumption)
- `@cocoar/ui/components` Angular UI component library:
  - **Display:** button, badge, tag, card, note, divider, table, label, icon, avatar, code-block, scrollbar, progress-bar, spinner, link
  - **Forms:** text-input, number-input, password-input, checkbox, radio, select, switch (all with `ControlValueAccessor` support)
  - **Navigation:** tabs, sidebar, breadcrumb, pagination, navbar
  - **Overlay:** popover, tooltip, popconfirm, dialog (`CoarDialogService`), toast (`CoarToastService`)
  - **Date & Time:** plain-date-picker, plain-date-time-picker, zoned-date-time-picker, time-picker, scrollable-calendar, mini-calendar, month-list
- `@cocoar/ui/menu` context menu and menu bar components
- `@cocoar/ui/overlay` generic overlay/popover positioning system
- `@cocoar/localization` with pluggable timezone provider chain
- Auto-generated `llms.txt` / `llms-full.txt` component API documentation
- Scenario testing infrastructure (`@cocoar/scenar`)
