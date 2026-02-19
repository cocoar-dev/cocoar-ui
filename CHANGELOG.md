# Changelog

## [0.2.0] - 2026-02-19

### Changed

- **data-grid:** Upgrade AG Grid peer dependency from `^33.0.0` to `^35.0.0` (`ag-grid-community`, `ag-grid-angular`)
- **data-grid:** Migrate `rowSelection` internally from deprecated string format to AG Grid v35 object format (`{ mode: 'singleRow' | 'multiRow' }`). Public builder API unchanged.
- **data-grid:** Remove deprecated `suppressPropertyNamesCheck` from default grid options

### Added

- **data-grid:** Comprehensive README with full API documentation for grid builder, column builder, column factory, directive, theming, cell renderers, and usage examples

### Removed

- **data-grid:** Delete `coar-data-grid.docs.md` (content consolidated into README)

## [0.1.1] - 2026-02-18

### Fixed

- **Overlay — Angular CDK coexistence** (`@cocoar/ui/overlay`): Overlay host and backdrop
  elements now use `popover="manual"`, placing them in the browser's
  [top layer](https://developer.mozilla.org/en-US/docs/Glossary/Top_layer).
  This fixes a stacking conflict where Angular CDK overlays (which also use `popover="manual"`)
  would always render on top of Coar overlays regardless of open order. With this fix, both
  overlay systems coexist correctly: whichever overlay is opened last is rendered on top.
  UA default styles introduced by the `[popover]` attribute (`border`, `padding`, `background`,
  `inset`, `margin`, `overflow`) are explicitly reset so existing visual behaviour is unchanged.

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
