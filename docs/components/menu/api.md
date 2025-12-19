# Menu API Reference

> **Complete API documentation for Cocoar Menu components**

This document provides detailed API information for all menu-related components.

---

## Components Overview

| Component | Purpose |
| --- | --- |
| [CoarMenuComponent](#coarmenucomponent) | Container for menu items |
| [CoarMenuItemComponent](#coarmenuitemcomponent) | Individual menu action item |
| [CoarSubmenuItemComponent](#coarsubmenuitemcomponent) | Menu item with nested flyout submenu |
| [CoarSubAccordionComponent](#coarsubaccordioncomponent) | Menu item with nested inline accordion submenu |
| [CoarMenuDividerComponent](#coarmenudividercomponent) | Visual separator between items |

---

## CoarMenuComponent

**Selector:** `coar-menu`

**Purpose:** Container component providing the menu structure, styling, and semantic HTML.

### Description

The menu component is a simple container that applies consistent styling via CSS variables. It provides the semantic `role="menu"` and wraps menu items, submenus, and dividers.

Use standalone for inline menus, or as content in `CoarOverlayService` for context menus and dropdowns.

### Usage

```html
<coar-menu>
  <coar-menu-item icon="plus">Create</coar-menu-item>
  <coar-menu-item icon="copy">Duplicate</coar-menu-item>
  <coar-menu-divider />
  <coar-menu-item icon="trash">Delete</coar-menu-item>
</coar-menu>
```

### Inputs

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `aimEnabled` | `boolean \| undefined` | No | `true` | Enable/disable menu-aim (delayed switching between sibling submenus) |
| `aimDebugEnabled` | `boolean \| undefined` | No | `false` | Emits debug events used by the showcase aim overlay |
| `aimSwitchDelayMs` | `number \| undefined` | No | `500` | Delay before switching to a newly hovered sibling submenu when aim is detected |
| `aimSampleMaxAgeMs` | `number \| undefined` | No | `200` | Max age of pointer samples used for aim detection |

### Outputs

None.

### Host Attributes

- `role="menu"` — ARIA role for semantic menu structure
- `class="coar-menu"` — CSS class for styling

### Styling

All styles use design tokens:
- `--coar-background-neutral-primary` — Background color
- `--coar-border-neutral` — Border color
- `--coar-shadow-m` — Box shadow
- `--coar-radius-s` — Border radius
- `--coar-spacing-s` — Padding

### Accessibility

- Semantic `role="menu"` for screen readers
- Contains `role="menuitem"` children
- No keyboard logic (handled by individual items)

---

## CoarMenuItemComponent

**Selector:** `coar-menu-item`

**Purpose:** Individual menu item with optional icon, label, and action handler.

### Description

Represents a single actionable menu item. Supports icons, disabled state, and click events. Can be used in both top-level menus and nested submenus.

### Usage

```html
<coar-menu-item
  icon="copy"
  [disabled]="false"
  (itemClick)="onCopy()"
>Copy Item</coar-menu-item>
```

### Inputs

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | No | `''` | Item text content |
| `icon` | `CoreIconName \| undefined` | No | `undefined` | Optional icon identifier (rendered via CoarIconComponent) |
| `disabled` | `boolean` | No | `false` | Disabled state prevents interaction |

### Outputs

| Name | Type | Description |
| --- | --- | --- |
| `itemClick` | `void` | Emitted when user clicks/selects the item (not fired when disabled) |
| `itemHover` | `Event` | Emitted when user hovers over item (used internally for flyout trigger) |

### Host Attributes

- `role="menuitem"` — ARIA role for menu item
- `tabindex="0"` — Focusable (or `-1` when disabled)
- `aria-disabled="true"` — Applied when disabled
- `class="coar-menu-item"` — CSS class
- `class="coar-menu-item--disabled"` — Applied when disabled

### Examples

#### Basic Item

```html
<coar-menu-item label="Save" (itemClick)="onSave()" />
```

#### Item with Icon

```html
<coar-menu-item
  icon="trash"
  label="Delete"
  (itemClick)="onDelete()"
/>
```

#### Disabled Item

```html
<coar-menu-item
  icon="clipboard"
  label="Paste"
  [disabled]="!hasClipboard"
  (itemClick)="onPaste()"
/>
```

### Styling

All styles use design tokens:
- `--coar-text-neutral-primary` — Default text color
- `--coar-text-neutral-secondary` — Disabled text color
- `--coar-menu-item-background-hover` — Hover background
- `--coar-menu-item-background-focus` — Focus background
- `--coar-spacing-xs`, `--coar-spacing-s` — Padding
- Icons use `size="sm"` (16px)

### Accessibility

- `role="menuitem"` for screen readers
- `tabindex` managed for keyboard navigation
- `aria-disabled="true"` when disabled
- Focus-visible styles for keyboard users
- Click handler disabled when `disabled` is true

---

## CoarSubmenuItemComponent

**Selector:** `coar-submenu-item` (alias: `coar-sub-flyout`)

**Purpose:** Menu item that opens a nested submenu on hover.

### Description

A special menu item that triggers a flyout submenu when hovered. Uses the Cocoar Overlay System with `coarHoverMenuPreset` to position the submenu. Supports nested submenus (can contain other `coar-submenu-item` components).

### Usage

```html
<coar-sub-flyout icon="users" label="Share">
  <ng-template>
    <coar-menu>
      <coar-menu-item icon="chat" (itemClick)="shareEmail()">Email</coar-menu-item>
      <coar-menu-item icon="copy" (itemClick)="shareCopyLink()">Copy Link</coar-menu-item>
    </coar-menu>
  </ng-template>
</coar-sub-flyout>

<!-- Also supported (external template): -->
<coar-submenu-item icon="users" label="Share" [submenuTemplate]="shareMenu" />

<ng-template #shareMenu>
  <coar-menu>
    <coar-menu-item icon="chat">Email</coar-menu-item>
    <coar-menu-item icon="copy">Copy Link</coar-menu-item>
  </coar-menu>
</ng-template>
```

### Inputs

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | Yes | — | Submenu trigger text |
| `icon` | `CoreIconName \| undefined` | No | `undefined` | Optional icon identifier |
| `disabled` | `boolean` | No | `false` | Disabled state prevents interaction |
| `submenuTemplate` | `TemplateRef<unknown> \| null` | No | `null` | External template containing submenu content (used when no inline `<ng-template>` is provided) |

### Outputs

None.

### Host Attributes

- `role="menuitem"` — ARIA role
- `aria-haspopup="menu"` — Indicates submenu presence
- `aria-expanded="true|false"` — Reflects submenu open/closed state
- `aria-disabled="true"` — Applied when disabled
- `tabindex="0"` — Focusable (or `-1` when disabled)
- `class="coar-submenu-item"` — CSS class
- `class="coar-submenu-item--disabled"` — Applied when disabled
- `class="coar-submenu-item--open"` — Applied when submenu is open

### Behavior

#### Hover Delay
- Opens immediately on hover
- Uses hoverTree dismissal from the overlay preset (default delay 300ms)

#### Keyboard Navigation
- `→` — Open submenu
- `←` — Close submenu and return to parent
- `Enter` / `Space` — Toggle submenu open/closed

#### Mouse Interaction
- Hover over item opens submenu
- Moving mouse to submenu keeps it open
- Leaving the submenu “hover tree” closes after the hoverTree delay (default 300ms)
- Re-entering the hover tree cancels the scheduled close

### Examples

#### Basic Submenu

```html
<coar-submenu-item icon="settings" label="Settings">
  <ng-template>
    <coar-menu>
      <coar-menu-item>Preferences</coar-menu-item>
      <coar-menu-item>Keyboard Shortcuts</coar-menu-item>
      <coar-menu-item>Extensions</coar-menu-item>
    </coar-menu>
  </ng-template>
</coar-submenu-item>
```

#### Nested Submenu

```html
<coar-sub-flyout icon="load" label="Export">
  <ng-template>
    <coar-menu>
      <coar-menu-item>PDF</coar-menu-item>
      <coar-menu-item>CSV</coar-menu-item>

      <coar-sub-flyout label="Advanced">
        <ng-template>
          <coar-menu>
            <coar-menu-item>JSON</coar-menu-item>
            <coar-menu-item>XML</coar-menu-item>
            <coar-menu-item>YAML</coar-menu-item>
          </coar-menu>
        </ng-template>
      </coar-sub-flyout>
    </coar-menu>
  </ng-template>
</coar-sub-flyout>
```

#### Disabled Submenu

```html
<coar-sub-flyout icon="users" label="Share" [disabled]="!canShare" [submenuTemplate]="shareMenu" />

<ng-template #shareMenu>
  <coar-menu>
    <coar-menu-item>Email</coar-menu-item>
    <coar-menu-item>Copy Link</coar-menu-item>
  </coar-menu>
</ng-template>
```

### Styling

All styles use design tokens:
- `--coar-text-neutral-primary` — Default text color
- `--coar-text-neutral-secondary` — Disabled text color
- `--coar-menu-item-background-hover` — Hover background
- `--coar-menu-item-background-focus` — Focus background
- `--coar-menu-item-background-open` — Open/active background
- `--coar-spacing-xs`, `--coar-spacing-s` — Padding
- Leading icon: `size="sm"` (16px)
- Chevron arrow: `size="xs"` (12px), `name="chevron-right"`

### Accessibility

- `role="menuitem"` with `aria-haspopup="menu"`
- `aria-expanded` reflects submenu state
- `aria-disabled="true"` when disabled
- Focusable via `tabindex` (disabled items are not focusable)
- `Enter`/`Space` toggles the submenu when focused

### Integration with Overlay System

The submenu uses `CoarOverlayService` with `coarHoverMenuPreset`:

```typescript
// Internal implementation (reference only)
const spec = Overlay.define<void>((b) => {
  b.content((c) => c.fromTemplate(submenuTemplate));
  b.anchor({ kind: 'element', element: triggerElement });
  b.position({ placement: ['right-start', 'left-start'], offset: -4, flip: true, shift: true });
}, coarHoverMenuPreset);
```

See [Cocoar Overlay System — Presets](../../libs/ui-overlay/overview.md#presets) for more details.

---

## CoarSubAccordionComponent

**Selector:** `coar-sub-accordion`

**Purpose:** Menu item that expands/collapses a nested submenu inline.

### Description

This variant renders its submenu content inline, which is useful for sidebar-style option groups where nested items should remain visible.

### Usage

```html
<coar-sub-accordion icon="settings" label="Options" [(open)]="optionsOpen">
  <ng-template>
    <coar-menu-item icon="plus" (itemClick)="onAdd()">Add</coar-menu-item>
    <coar-menu-item icon="trash" (itemClick)="onClear()">Clear</coar-menu-item>
  </ng-template>
</coar-sub-accordion>
```

### Inputs

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | Yes | — | Submenu trigger text |
| `icon` | `CoreIconName \| undefined` | No | `undefined` | Optional icon identifier |
| `disabled` | `boolean` | No | `false` | Disabled state prevents interaction |
| `open` | `boolean` | No | `false` | Expanded state (two-way bindable with `[(open)]`) |
| `submenuTemplate` | `TemplateRef<unknown> \| null` | No | `null` | External template containing submenu content (used when no inline `<ng-template>` is provided) |

### Outputs

| Name | Type | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Emitted when expanded state changes (for `[(open)]`) |

---

## CoarMenuDividerComponent

**Selector:** `coar-menu-divider`

**Purpose:** Visual separator between menu items.

### Description

Simple horizontal line for grouping related menu items. No inputs, outputs, or logic — just styling.

### Usage

```html
<coar-menu>
  <coar-menu-item label="Cut" />
  <coar-menu-item label="Copy" />
  <coar-menu-divider />
  <coar-menu-item label="Paste" />
</coar-menu>
```

### Inputs

None.

### Outputs

None.

### Host Attributes

- `role="separator"` — ARIA role for semantic divider
- `class="coar-menu-divider"` — CSS class for styling

### Styling

Uses design tokens:
- `--coar-border-neutral-tertiary` — Divider line color
- `--coar-spacing-xs` — Vertical margin

### Accessibility

- `role="separator"` for screen readers
- Ignored during keyboard navigation

---

## TypeScript Types

### CoreIconName

Type for icon names used in menu items:

```typescript
type CoreIconName =
  | 'plus' | 'minus' | 'copy' | 'clipboard' | 'trash' | 'bin'
  | 'chat' | 'users' | 'settings' | 'chevron-right' | 'chevron-left'
  | 'chevron-down' | 'chevron-up' | 'check' | 'load' | 'key'
  | 'padlock' | 'lock' | 'user'
  // ... and more (see @cocoar/ui-components/coar-icon/core-icons)
  | (string & {}); // allows custom icons
```

See [CoarIconComponent — Core Icons](../icon/core-icons.md) for the full list.

---

## Design Tokens Reference

### Menu Container

| Token | Purpose | Default Fallback |
| --- | --- | --- |
| `--coar-background-neutral-primary` | Menu background | `#ffffff` |
| `--coar-border-neutral` | Menu border | `#d0d0d0` |
| `--coar-shadow-m` | Menu shadow | `0 4px 8px rgba(0, 0, 0, 0.1)` |
| `--coar-radius-s` | Border radius | `4px` |
| `--coar-spacing-s` | Padding | `8px` |

### Menu Items

| Token | Purpose | Default Fallback |
| --- | --- | --- |
| `--coar-text-neutral-primary` | Default text | `#1a1a1a` |
| `--coar-text-neutral-secondary` | Disabled text | `#999999` |
| `--coar-surface-accent-subtle` | Hover/focus background | `rgba(0, 0, 0, 0.04)` |
| `--coar-spacing-xs` | Small padding | `4px` |
| `--coar-spacing-s` | Medium padding | `8px` |

### Divider

| Token | Purpose | Default Fallback |
| --- | --- | --- |
| `--coar-border-neutral-tertiary` | Divider line | `#f0f0f0` |
| `--coar-spacing-xs` | Vertical margin | `4px` |

---

## Import Paths

```typescript
// Components
import {
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarSubmenuItemComponent,
  CoarMenuDividerComponent
} from '@cocoar/ui-components';

// Overlay System (for context menus)
import {
  CoarOverlayService,
  Overlay,
  coarMenuPreset,
  coarHoverMenuPreset
} from '@cocoar/ui-overlay';

// Types
import type { CoreIconName } from '@cocoar/ui-components';
```

---

## Related APIs

- [Cocoar Overlay System API](../../libs/ui-overlay/overview.md#api-reference)
- [CoarIconComponent API](../icon/api.md)
- [Design Tokens Reference](../../foundations/design-tokens.md)

---

## Version

**Current Version:** 0.1.0

**Last Updated:** December 18, 2025

**Auto-Generated API:** See [ui-components.md](../../reference/ui-components.md#coar-menu-item) for machine-generated API documentation.
