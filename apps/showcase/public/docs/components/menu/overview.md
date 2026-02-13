# Cocoar Menu System

> **Complete menu component system for context menus, dropdowns, and navigation menus**

The Cocoar Menu System provides a flexible set of components for building accessible, keyboard-navigable menus in Angular applications. It integrates seamlessly with the Cocoar Overlay System (`@cocoar/ui/overlay`) for context menus and flyouts.

---

## Features

- ✅ **Keyboard-friendly** — Tab/Shift+Tab, Enter/Space
- ✅ **Accessible** — Complete ARIA support, screen reader friendly
- ✅ **Design token styling** — All styles via CSS variables
- ✅ **Icon support** — Type-safe icons via `CoreIconName`
- ✅ **Nested submenus** — Flyout submenus with optional “menu-aim” sibling switching
- ✅ **Context menu support** — Works with overlay positioning system

---

## Components

### CoarMenuComponent
Container for menu items. Provides the semantic menu structure and styling.

### CoarMenuItemComponent
Individual menu action item with optional icon, label, and click handler.

### CoarMenuHeadingComponent
Non-interactive section heading for grouping menu items. Useful for sidebar navigation.

### CoarSubmenuItemComponent
Menu item that opens a nested submenu (flyout) on hover/click.

Also available via the alias selector `coar-sub-flyout`.

### CoarSubExpandComponent
Menu item that expands/collapses a nested submenu inline (click to toggle).

Formerly known as `CoarSubAccordionComponent`. Use `coar-sub-expand` for clarity.

### CoarMenuDividerComponent
Visual separator for grouping related menu items.

---

## Styling Variants

### Context Menu (Default)
Lightweight, subtle colors optimized for overlay menus and dropdowns.

### Sidebar Navigation
Add the `coar-menu--sidebar` class for darker, more grounded colors suitable for permanent navigation:

```html
<coar-menu class="coar-menu--sidebar">
  <coar-menu-heading>Foundations</coar-menu-heading>
  <coar-menu-item icon="palette">Colors</coar-menu-item>
  <coar-menu-item icon="text">Typography</coar-menu-item>
</coar-menu>
```

The sidebar variant uses semantic neutral tokens and increases heading font size to 16px for better readability.

---

## Installation

```bash
npm install @cocoar/ui/menu @cocoar/ui
```

Import CSS tokens (global stylesheet):

```css
@import '@cocoar/ui/styles/tokens/all.css';
```

---

## Basic Usage

### Simple Menu

```typescript
import {
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarMenuDividerComponent
} from '@cocoar/ui/menu';

@Component({
  standalone: true,
  imports: [
    CoarMenuComponent,
    CoarMenuItemComponent,
    CoarMenuDividerComponent
  ],
  template: `
    <coar-menu>
      <coar-menu-item icon="plus" (itemClick)="onCreate()">Create New</coar-menu-item>
      <coar-menu-item icon="copy" (itemClick)="onDuplicate()">Duplicate</coar-menu-item>
      <coar-menu-divider />
      <coar-menu-item icon="trash" (itemClick)="onDelete()">Delete</coar-menu-item>
    </coar-menu>
  `
})
export class MyComponent {
  onCreate() {}
  onDuplicate() {}
  onDelete() {}
}
```

### Menu with Nested Submenu

```typescript
import {
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarSubmenuItemComponent,
  CoarSubExpandComponent,
  CoarMenuDividerComponent
} from '@cocoar/ui/menu';

@Component({
  standalone: true,
  imports: [
    CoarMenuComponent,
    CoarMenuItemComponent,
    CoarSubmenuItemComponent,
    CoarSubExpandComponent,
    CoarMenuDividerComponent
  ],
  template: `
    <coar-menu>
      <coar-menu-item icon="copy" (itemClick)="onCopy()">Copy</coar-menu-item>

      <coar-sub-flyout icon="users" label="Share">
        <ng-template>
          <coar-menu>
            <coar-menu-item icon="chat" (itemClick)="shareEmail()">Email</coar-menu-item>
            <coar-menu-item icon="copy" (itemClick)="shareCopyLink()">Copy Link</coar-menu-item>
          </coar-menu>
        </ng-template>
      </coar-sub-flyout>

      <coar-sub-expand icon="settings" label="Options">
        <ng-template>
          <coar-menu-item icon="plus" (itemClick)="onAdd()">Add</coar-menu-item>
          <coar-menu-item icon="trash" (itemClick)="onClear()">Clear</coar-menu-item>
        </ng-template>
      </coar-sub-expand>

      <coar-menu-divider />
      <coar-menu-item icon="trash" (itemClick)="onDelete()">Delete</coar-menu-item>
    </coar-menu>
  `
})
export class MyComponent {
  onCopy() {}
  shareEmail() {}
  shareCopyLink() {}
  onAdd() {}
  onClear() {}
  onDelete() {}
}
```

### Context Menu with Overlay System

For context menus triggered by right-click or button actions, use the **Cocoar Overlay System**:

```typescript
import { Component, ViewChild, TemplateRef, inject } from '@angular/core';
import { createOverlayBuilder, coarMenuPreset, type OverlayRef } from '@cocoar/ui/overlay';
import {
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarMenuDividerComponent
} from '@cocoar/ui/components';

@Component({
  standalone: true,
  imports: [
    CoarMenuComponent,
    CoarMenuItemComponent,
    CoarMenuDividerComponent
  ],
  template: `
    <div
      class="target"
      (contextmenu)="onContextMenu($event)"
    >
      Right-click me
    </div>

    <ng-template #contextMenuTemplate>
      <coar-menu>
        <coar-menu-item icon="copy" (itemClick)="onCopy()">Copy</coar-menu-item>
        <coar-menu-item icon="clipboard" (itemClick)="onPaste()">Paste</coar-menu-item>
        <coar-menu-divider />
        <coar-menu-item icon="trash" (itemClick)="onDelete()">Delete</coar-menu-item>
      </coar-menu>
    </ng-template>
  `
})
export class MyComponent {
  private readonly overlay = createOverlayBuilder(coarMenuPreset);

  @ViewChild('contextMenuTemplate') contextMenuTemplate!: TemplateRef<unknown>;

  private contextMenuRef: OverlayRef | null = null;

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();

    // Close existing menu if open
    this.contextMenuRef?.close();

    // Open menu at mouse position
    this.contextMenuRef = this.overlay
      .anchor({ kind: 'point', x: event.clientX, y: event.clientY })
      .position({ placement: 'bottom-start', offset: 4, flip: true, shift: true })
      .fromTemplate(this.contextMenuTemplate)
      .open(undefined);
  }

  onCopy() { this.contextMenuRef?.close(); }
  onPaste() { this.contextMenuRef?.close(); }
  onDelete() { this.contextMenuRef?.close(); }
}
```

> **Note:** The `coarMenuPreset` provides standard menu behavior:
> - Close on outside click
> - Close on item click (default; call `$event.keepMenuOpen()` to prevent)
> - Close on Escape key
> - Close on scroll
> - Positioned relative to anchor point

---

## Icons

Menu items support type-safe icons via `CoreIconName`:

```html
<coar-menu-item icon="plus">Add</coar-menu-item>
<coar-menu-item icon="copy">Copy</coar-menu-item>
<coar-menu-item icon="trash">Delete</coar-menu-item>
<coar-menu-item icon="settings">Settings</coar-menu-item>
```

Available icons: `plus`, `minus`, `copy`, `clipboard`, `trash`, `bin`, `chat`, `users`, `settings`, `chevron-right`, `chevron-left`, `chevron-down`, `chevron-up`, `check`, `load`, and [many more](../icon/core-icons.md).

See [CoarIconComponent documentation](../icon/overview.md) for the full list.

---

## Disabled State

Disable menu items to prevent interaction:

```html
<coar-menu>
  <coar-menu-item icon="copy" label="Copy" (itemClick)="onCopy()" />
  <coar-menu-item
    icon="clipboard"
    label="Paste"
    [disabled]="!hasClipboard"
    (itemClick)="onPaste()"
  />
</coar-menu>
```

Disabled items:
- Are visually dimmed
- Cannot be clicked
- Are skipped during keyboard navigation
- Have `aria-disabled="true"` for screen readers

---

## Keyboard Navigation

Menus are keyboard accessible:

| Key | Action |
| --- | --- |
| `Tab` / `Shift+Tab` | Move focus between items (disabled items are not focusable) |
| `Enter` / `Space` | Activate a focused item (`coar-submenu-item` toggles its submenu) |
| `Escape` | Close the menu when hosted in an overlay configuration that enables it (e.g. `coarMenuPreset`) |

---

## Accessibility

All menu components follow [ARIA Authoring Practices Guide for Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/):

- **Semantic HTML**: `role="menu"`, `role="menuitem"`, `role="separator"`
- **Keyboard Support**: Focusable items + Enter/Space activation
- **Screen Readers**: Proper ARIA attributes (`aria-disabled`, `aria-haspopup`, `aria-expanded`)
- **Focus Management**: Visible focus indicators for keyboard users
- **State Announcements**: Disabled state communicated to assistive technologies

---

## Design Tokens

All menu styling uses design tokens from `@cocoar/ui`:

### Menu Container
- `--coar-background-neutral-primary` — Menu background
- `--coar-border-neutral` — Menu border
- `--coar-shadow-m` — Menu shadow (medium elevation)
- `--coar-radius-s` — Border radius (4px)

### Menu Items
- `--coar-text-neutral-primary` — Default text color
- `--coar-text-neutral-secondary` — Disabled text color
- `--coar-menu-item-background-hover` — Hover background
- `--coar-menu-item-background-focus` — Focus background
- `--coar-menu-item-background-open` — Open/active background
- `--coar-spacing-xs`, `--coar-spacing-s`, `--coar-spacing-m` — Padding values

### Divider
- `--coar-border-neutral-tertiary` — Divider line color

### Icons
- Icons inherit parent text color via `currentColor`
- Size: `sm` (16px) for menu item icons
- Size: `xs` (12px) for submenu chevron arrows

---

## Nested Submenus

The `coar-submenu-item` component provides flyout submenus:

```html
<coar-menu>
  <coar-menu-item icon="copy">Copy</coar-menu-item>

  <coar-submenu-item icon="users" label="Share">
    <ng-template>
      <coar-menu>
        <!-- Nested submenus are supported -->
        <coar-menu-item icon="chat">Email</coar-menu-item>
        <coar-menu-item icon="copy">Copy Link</coar-menu-item>

        <coar-submenu-item icon="load" label="Export">
          <ng-template>
            <coar-menu>
              <coar-menu-item>PDF</coar-menu-item>
              <coar-menu-item>CSV</coar-menu-item>
              <coar-menu-item>JSON</coar-menu-item>
            </coar-menu>
          </ng-template>
        </coar-submenu-item>
      </coar-menu>
    </ng-template>
  </coar-submenu-item>
</coar-menu>
```

### Submenu Behavior
- **HoverTree close delay**: defaults to 300ms via `coarHoverMenuPreset`
- **Mouse movement**: Moving mouse to submenu keeps both parent and child open
- **Keyboard**: Use `→` to open, `←` to close
- **Disabled**: Submenu items can be disabled like regular items
- **Positioning**: Uses overlay system with automatic flip to stay in viewport

---

## Integration with Overlay System

Menus work seamlessly with the Cocoar Overlay System (`@cocoar/ui/overlay`) via the builder-only API.

### Preset constants

Use `coarMenuPreset` or `coarHoverMenuPreset` as reusable defaults:

```typescript
import { createOverlayBuilder, coarMenuPreset } from '@cocoar/ui/overlay';

const overlay = createOverlayBuilder(coarMenuPreset);

const ref = overlay
  .anchor({ kind: 'point', x: mouseX, y: mouseY })
  .position({ placement: 'bottom-start', offset: 4, flip: true, shift: true })
  .fromTemplate(menuTemplate)
  .open(undefined);
```

---

## Examples

### Action Menu (Dropdown)

```typescript
@Component({
  template: `
    <button (click)="openMenu($event)">
      Actions
    </button>

    <ng-template #menuTemplate>
      <coar-menu>
        <coar-menu-item icon="plus" (itemClick)="onNew()">New Item</coar-menu-item>
        <coar-menu-item icon="copy" (itemClick)="onDuplicate()">Duplicate</coar-menu-item>
        <coar-menu-divider />
        <coar-menu-item icon="trash" (itemClick)="onDelete()">Delete</coar-menu-item>
      </coar-menu>
    </ng-template>
  `
})
export class ActionMenuComponent {
  private readonly overlay = createOverlayBuilder(coarMenuPreset);
  @ViewChild('menuTemplate') menuTemplate!: TemplateRef<unknown>;

  openMenu(event: MouseEvent): void {
    this.overlay
      .anchor({ kind: 'element', element: event.target as HTMLElement })
      .position({ placement: 'bottom-start', offset: 4, flip: true, shift: true })
      .fromTemplate(this.menuTemplate)
      .open(undefined);
  }

  onNew() {}
  onDuplicate() {}
  onDelete() {}
}
```

### Multi-Level Submenu

```html
<coar-menu>
  <coar-menu-item icon="copy">Copy</coar-menu-item>
  <coar-menu-item icon="clipboard">Paste</coar-menu-item>

  <coar-menu-divider />

  <coar-submenu-item icon="load" label="Export">
    <ng-template>
      <coar-menu-item>PDF</coar-menu-item>
      <coar-menu-item>CSV</coar-menu-item>

      <coar-submenu-item label="Advanced">
        <ng-template>
          <coar-menu-item>JSON</coar-menu-item>
          <coar-menu-item>XML</coar-menu-item>
          <coar-menu-item>YAML</coar-menu-item>
        </ng-template>
      </coar-submenu-item>
    </ng-template>
  </coar-submenu-item>

  <coar-menu-divider />

  <coar-menu-item icon="settings">Settings</coar-menu-item>
</coar-menu>
```

---

## Best Practices

### ✅ Do

- **Use semantic actions**: Menu items should represent clear, actionable commands
- **Group related items**: Use dividers to separate logical groups
- **Provide icons**: Icons improve scannability (but aren't required)
- **Handle disabled state**: Disable items that aren't currently available
- **Close menu after action**: In context menus, close the overlay after an item is clicked
- **Use meaningful labels**: Clear, concise text (e.g., "Delete Item" not "Delete")

### ❌ Don't

- **Don't overuse submenus**: More than 2 levels deep hurts usability
- **Don't mix navigation and actions**: Menus are for commands, not page navigation
- **Don't forget keyboard support**: Always test with keyboard-only navigation
- **Don't hardcode colors**: Always use design tokens for consistent theming
- **Don't omit ARIA labels**: Essential for screen reader users

---

## API Reference

For detailed API documentation, see:
- [Menu API Reference](./api.md)
- Cocoar Overlay System API (`@cocoar/ui/overlay`)

---

## Related Components

- [CoarIconComponent](../icon/overview.md) — Icon system used in menu items
- Cocoar Overlay System (`@cocoar/ui/overlay`) — Overlay builder used for context menus
- [CoarTooltipComponent](../tooltip/overview.md) — Alternative for informational overlays

---

## Further Reading

- [ARIA Authoring Practices Guide — Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)
- [MDN — ARIA role="menu"](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/menu_role)
- [Cocoar Design System — NAMING.md](../../../NAMING.md)
- [Cocoar Design System — ARCHITECTURE.md](../../../ARCHITECTURE.md)
