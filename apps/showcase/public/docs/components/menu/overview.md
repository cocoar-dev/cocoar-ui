# Cocoar Menu System

> **Complete menu component system for context menus, dropdowns, and navigation menus**

The Cocoar Menu System provides a flexible set of components for building accessible, keyboard-navigable menus in Angular applications. It integrates seamlessly with the [Cocoar Overlay System](../../libs/ui-overlay/overview.md) for context menus and flyouts.

---

## Features

- ✅ **Full keyboard navigation** — Arrow keys, Home/End, Enter/Space
- ✅ **Accessible** — Complete ARIA support, screen reader friendly
- ✅ **Design token styling** — All styles via CSS variables
- ✅ **Icon support** — Type-safe icons via `CoreIconName`
- ✅ **Nested submenus** — Flyout submenus with hover delay
- ✅ **Context menu support** — Works with overlay positioning system

---

## Components

### CoarMenuComponent
Container for menu items. Provides the semantic menu structure and styling.

### CoarMenuItemComponent
Individual menu action item with optional icon, label, and click handler.

### CoarSubmenuItemComponent
Menu item that opens a nested submenu on hover, with 300ms hover delay.

Also available via the alias selector `coar-sub-flyout`.

### CoarSubAccordionComponent
Menu item that expands/collapses a nested submenu inline.

### CoarMenuDividerComponent
Visual separator for grouping related menu items.

---

## Installation

```bash
npm install @cocoar/ui-components @cocoar/ui-tokens
```

Import CSS tokens (global stylesheet):

```css
@import '@cocoar/ui-tokens/css/all.css';
```

---

## Basic Usage

### Simple Menu

```typescript
import {
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarMenuDividerComponent
} from '@cocoar/ui-components';

@Component({
  standalone: true,
  imports: [
    CoarMenuComponent,
    CoarMenuItemComponent,
    CoarMenuDividerComponent
  ],
  template: `
    <coar-menu>
      <coar-menu-item icon="plus" label="Create New" (itemClick)="onCreate()" />
      <coar-menu-item icon="copy" label="Duplicate" (itemClick)="onDuplicate()" />
      <coar-menu-divider />
      <coar-menu-item icon="trash" label="Delete" (itemClick)="onDelete()" />
    </coar-menu>
  `
})
export class MyComponent {
  onCreate() { console.log('Create'); }
  onDuplicate() { console.log('Duplicate'); }
  onDelete() { console.log('Delete'); }
}
```

### Menu with Nested Submenu

```typescript
import {
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarSubmenuItemComponent,
  CoarSubAccordionComponent,
  CoarMenuDividerComponent
} from '@cocoar/ui-components';

@Component({
  standalone: true,
  imports: [
    CoarMenuComponent,
    CoarMenuItemComponent,
    CoarSubmenuItemComponent,
    CoarSubAccordionComponent,
    CoarMenuDividerComponent
  ],
  template: `
    <coar-menu>
      <coar-menu-item icon="copy" label="Copy" (itemClick)="onCopy()" />

      <coar-sub-flyout icon="users" label="Share" [submenuTemplate]="shareMenu" />

      <coar-sub-accordion icon="settings" label="Options">
        <ng-template>
          <coar-menu-item icon="plus" label="Add" (itemClick)="onAdd()" />
          <coar-menu-item icon="trash" label="Clear" (itemClick)="onClear()" />
        </ng-template>
      </coar-sub-accordion>

      <ng-template #shareMenu>
        <coar-menu>
          <coar-menu-item icon="chat" label="Email" (itemClick)="shareEmail()" />
          <coar-menu-item icon="copy" label="Copy Link" (itemClick)="shareCopyLink()" />
        </coar-menu>
      </ng-template>

      <coar-menu-divider />
      <coar-menu-item icon="trash" label="Delete" (itemClick)="onDelete()" />
    </coar-menu>
  `
})
export class MyComponent {
  onCopy() { console.log('Copy'); }
  shareEmail() { console.log('Share via email'); }
  shareCopyLink() { console.log('Copy link'); }
  onAdd() { console.log('Add'); }
  onClear() { console.log('Clear'); }
  onDelete() { console.log('Delete'); }
}
```

### Context Menu with Overlay System

For context menus triggered by right-click or button actions, use the **Cocoar Overlay System**:

```typescript
import { Component, ViewChild, TemplateRef, inject } from '@angular/core';
import { CoarOverlayService, Overlay, coarMenuPreset } from '@cocoar/ui-overlay';
import {
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarMenuDividerComponent
} from '@cocoar/ui-components';

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
        <coar-menu-item icon="copy" label="Copy" (itemClick)="onCopy()" />
        <coar-menu-item icon="clipboard" label="Paste" (itemClick)="onPaste()" />
        <coar-menu-divider />
        <coar-menu-item icon="trash" label="Delete" (itemClick)="onDelete()" />
      </coar-menu>
    </ng-template>
  `
})
export class MyComponent {
  private readonly overlayService = inject(CoarOverlayService);

  @ViewChild('contextMenuTemplate') contextMenuTemplate!: TemplateRef<unknown>;

  private contextMenuRef: ReturnType<typeof this.overlayService.open> | null = null;

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();

    // Close existing menu if open
    this.contextMenuRef?.close();

    // Open menu at mouse position
    const spec = Overlay.define<void>((b) => {
      b.content((c) => c.fromTemplate(this.contextMenuTemplate));
      b.anchor({ kind: 'point', x: event.clientX, y: event.clientY });
      b.position({ placement: 'bottom-start', offset: 4, flip: true });
    }, coarMenuPreset);

    this.contextMenuRef = this.overlayService.open(spec, undefined);
  }

  onCopy() { console.log('Copy'); this.contextMenuRef?.close(); }
  onPaste() { console.log('Paste'); this.contextMenuRef?.close(); }
  onDelete() { console.log('Delete'); this.contextMenuRef?.close(); }
}
```

> **Note:** The `coarMenuPreset` provides standard menu behavior:
> - Close on outside click
> - Close on Escape key
> - Close on scroll
> - Positioned relative to anchor point

---

## Icons

Menu items support type-safe icons via `CoreIconName`:

```html
<coar-menu-item icon="plus" label="Add" />
<coar-menu-item icon="copy" label="Copy" />
<coar-menu-item icon="trash" label="Delete" />
<coar-menu-item icon="settings" label="Settings" />
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

Menus support full keyboard navigation out of the box:

| Key | Action |
| --- | --- |
| `Tab` | Focus the menu (first/last item based on direction) |
| `↓` `↑` | Navigate between items (wraps around, skips disabled) |
| `Enter` `Space` | Activate focused item |
| `→` | Open submenu (if on submenu item) |
| `←` | Close submenu and return to parent |
| `Escape` | Close menu (when used with overlay system) |
| `Home` | Jump to first item |
| `End` | Jump to last item |

---

## Accessibility

All menu components follow [ARIA Authoring Practices Guide for Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/):

- **Semantic HTML**: `role="menu"`, `role="menuitem"`, `role="separator"`
- **Keyboard Support**: Full arrow key navigation with roving tabindex
- **Screen Readers**: Proper ARIA attributes (`aria-disabled`, `aria-haspopup`, `aria-expanded`)
- **Focus Management**: Visible focus indicators for keyboard users
- **State Announcements**: Disabled state communicated to assistive technologies

---

## Design Tokens

All menu styling uses design tokens from `@cocoar/ui-tokens`:

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
  <coar-menu-item icon="copy" label="Copy" />

  <coar-submenu-item icon="users" label="Share" [submenuTemplate]="shareMenu" />

  <ng-template #shareMenu>
    <!-- Nested submenus are supported -->
    <coar-menu-item icon="chat" label="Email" />
    <coar-menu-item icon="copy" label="Copy Link" />

    <coar-submenu-item icon="load" label="Export" [submenuTemplate]="exportMenu" />

    <ng-template #exportMenu>
      <coar-menu-item label="PDF" />
      <coar-menu-item label="CSV" />
      <coar-menu-item label="JSON" />
    </ng-template>
  </ng-template>
</coar-menu>
```

### Submenu Behavior
- **Hover delay**: 1000ms before closing (prevents accidental closes)
- **Mouse movement**: Moving mouse to submenu keeps both parent and child open
- **Keyboard**: Use `→` to open, `←` to close
- **Disabled**: Submenu items can be disabled like regular items
- **Positioning**: Uses overlay system with automatic flip to stay in viewport

---

## Integration with Overlay System

Menus work seamlessly with the [Cocoar Overlay System](../../libs/ui-overlay/overview.md):

### Presets

Use `coarMenuPreset` or `coarHoverMenuPreset`:

```typescript
import { coarMenuPreset, coarHoverMenuPreset } from '@cocoar/ui-overlay';

// Standard menu (click-triggered)
const spec = Overlay.define((b) => {
  b.content((c) => c.fromTemplate(menuTemplate));
  b.anchor({ kind: 'point', x: mouseX, y: mouseY });
}, coarMenuPreset);

// Hover menu (for submenus)
const spec = Overlay.define((b) => {
  b.content((c) => c.fromTemplate(submenuTemplate));
  b.anchor({ kind: 'element', element: triggerElement, attachment: 'end-start' });
}, coarHoverMenuPreset);
```

### Preset Configuration

**`coarMenuPreset`:**
- Close on outside click: ✅
- Close on Escape: ✅
- Close on scroll: ✅
- Close on blur: ✅

**`coarHoverMenuPreset`:**
- Close on outside click: ✅
- Close on Escape: ✅
- Close on scroll: ❌ (keeps submenu open while hovering)
- Close on blur: ✅

See [Overlay System — Presets](../../libs/ui-overlay/overview.md#presets) for more details.

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
        <coar-menu-item icon="plus" label="New Item" (itemClick)="onNew()" />
        <coar-menu-item icon="copy" label="Duplicate" (itemClick)="onDuplicate()" />
        <coar-menu-divider />
        <coar-menu-item icon="trash" label="Delete" (itemClick)="onDelete()" />
      </coar-menu>
    </ng-template>
  `
})
export class ActionMenuComponent {
  private readonly overlayService = inject(CoarOverlayService);
  @ViewChild('menuTemplate') menuTemplate!: TemplateRef<unknown>;

  openMenu(event: MouseEvent): void {
    const spec = Overlay.define<void>((b) => {
      b.content((c) => c.fromTemplate(this.menuTemplate));
      b.anchor({ kind: 'element', element: event.target as HTMLElement, attachment: 'bottom-start' });
      b.position({ placement: 'bottom-start', offset: 4, flip: true });
    }, coarMenuPreset);

    this.overlayService.open(spec, undefined);
  }

  onNew() { console.log('New'); }
  onDuplicate() { console.log('Duplicate'); }
  onDelete() { console.log('Delete'); }
}
```

### Multi-Level Submenu

```html
<coar-menu>
  <coar-menu-item icon="copy" label="Copy" />
  <coar-menu-item icon="clipboard" label="Paste" />

  <coar-menu-divider />

  <coar-submenu-item icon="load" label="Export" [submenuTemplate]="exportMenu" />

  <ng-template #exportMenu>
    <coar-menu-item label="PDF" />
    <coar-menu-item label="CSV" />

    <coar-submenu-item label="Advanced" [submenuTemplate]="advancedMenu" />

    <ng-template #advancedMenu>
      <coar-menu-item label="JSON" />
      <coar-menu-item label="XML" />
      <coar-menu-item label="YAML" />
    </ng-template>
  </ng-template>

  <coar-menu-divider />

  <coar-menu-item icon="settings" label="Settings" />
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
- [Cocoar Overlay System API](../../libs/ui-overlay/overview.md#api-reference)

---

## Related Components

- [CoarIconComponent](../icon/overview.md) — Icon system used in menu items
- [CoarOverlayService](../../libs/ui-overlay/overview.md) — Positioning and lifecycle for context menus
- [CoarTooltipComponent](../tooltip/overview.md) — Alternative for informational overlays

---

## Further Reading

- [ARIA Authoring Practices Guide — Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)
- [MDN — ARIA role="menu"](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/menu_role)
- [Cocoar Design System — NAMING.md](../../../NAMING.md)
- [Cocoar Design System — ARCHITECTURE.md](../../../ARCHITECTURE.md)
