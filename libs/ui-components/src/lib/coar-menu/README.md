# Coar Menu Components

A complete set of menu components for creating context menus, dropdown menus, and navigation menus in your Angular application.

✅ **Full keyboard navigation** • ✅ **Accessible (ARIA)** • ✅ **Design token styling** • ✅ **Size variants**

## Components

### CoarMenuComponent
Main container for menu items.

**Inputs:**
- `mode: 'vertical' | 'horizontal' | 'inline'` - Menu display mode (default: 'vertical')
- `theme: 'light' | 'dark'` - Menu theme (default: 'light')
- `size: 'xs' | 'sm' | 'md' | 'lg'` - Menu size variant (default: 'md')
- `ariaLabel: string` - Accessible label for the menu (default: 'Menu')

**Keyboard Navigation:**
- `↓` / `↑` - Navigate menu items (wraps around, skips disabled)
- `Enter` / `Space` - Activate focused item
- `Home` / `End` - Jump to first/last item
- `→` / `←` - Expand/collapse submenus

**Accessibility:**
- Full ARIA support (`role="menu"`, `aria-orientation`, `aria-label`)
- Roving tabindex for keyboard navigation
- Focus management for disabled items
- Screen reader announcements

### CoarMenuItemComponent
Individual menu item.

**Inputs:**
- `icon?: CoreIconName` - Icon to display before the title
- `title: string` - Menu item text
- `disabled: boolean` - Whether the item is disabled (default: false)
- `selected: boolean` - Whether the item is selected/active (default: false)

**Outputs:**
- `clicked: EventEmitter<MouseEvent>` - Emitted when the menu item is clicked (not fired when disabled)

**Methods:**
- `focus(): void` - Focus this item (used by keyboard navigation)
- `activate(): void` - Programmatically activate this item

**Accessibility:**
- `role="menuitem"`, `tabindex="-1"` (managed by parent)
- `aria-disabled`, `aria-selected` attributes
- Focus-visible styles for keyboard users

### CoarMenuSubmenuComponent
Expandable submenu with nested items.

**Inputs:**
- `icon?: CoreIconName` - Icon to display before the title
- `title: string` - Submenu title (required)
- `defaultOpen: boolean` - Whether the submenu is initially open (default: false)
- `disabled: boolean` - Whether the submenu is disabled (default: false)

**Methods:**
- `open(): void` - Open the submenu programmatically
- `close(): void` - Close the submenu programmatically
- `toggleOpen(): void` - Toggle open/closed state

**Keyboard Navigation:**
- `→` - Expand submenu
- `←` - Collapse submenu
- `Enter` / `Space` - Toggle submenu

**Accessibility:**
- `role="button"`, `aria-expanded`, `aria-haspopup="true"`
- Focus management for disabled state
- Proper nesting with child `role="menu"`

### CoarMenuDividerComponent
Visual separator between menu items.

## Usage

### Basic Menu

```typescript
import {
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarMenuDividerComponent
} from '@cocoar/ui-components';

@Component({
  imports: [CoarMenuComponent, CoarMenuItemComponent, CoarMenuDividerComponent],
  template: `
    <coar-menu mode="vertical" size="md" ariaLabel="Actions menu">
      <coar-menu-item
        icon="add"
        title="Create New"
        (clicked)="onCreate()"
      />
      <coar-menu-item
        icon="copy"
        title="Duplicate"
        (clicked)="onDuplicate()"
      />
      <coar-menu-divider />
      <coar-menu-item
        icon="bin"
        title="Delete"
        (clicked)="onDelete()"
      />
    </coar-menu>
  `
})
```

### Menu with Submenu

```typescript
import {
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarMenuSubmenuComponent,
  CoarMenuDividerComponent
} from '@cocoar/ui-components';

@Component({
  imports: [
    CoarMenuComponent,
    CoarMenuItemComponent,
    CoarMenuSubmenuComponent,
    CoarMenuDividerComponent
  ],
  template: `
    <coar-menu mode="vertical" size="md">
      <coar-menu-item title="Open" (clicked)="onOpen()" />

      <coar-menu-submenu title="Status" icon="settings" [defaultOpen]="false">
        <coar-menu-item title="New" (clicked)="setStatus('new')" />
        <coar-menu-item title="In Progress" (clicked)="setStatus('inProgress')" />
        <coar-menu-item title="Done" (clicked)="setStatus('done')" />
      </coar-menu-submenu>

      <coar-menu-divider />

      <coar-menu-item
        title="Delete"
        icon="bin"
        (clicked)="onDelete()"
      />
    </coar-menu>
  `
})
```

### Size Variants

```typescript
@Component({
  template: `
    <!-- Extra small menu -->
    <coar-menu size="xs">
      <coar-menu-item title="Small item" />
    </coar-menu>

    <!-- Small menu -->
    <coar-menu size="sm">
      <coar-menu-item title="Medium item" />
    </coar-menu>

    <!-- Medium (default) -->
    <coar-menu size="md">
      <coar-menu-item title="Default item" />
    </coar-menu>

    <!-- Large menu -->
    <coar-menu size="lg">
      <coar-menu-item title="Large item" />
    </coar-menu>
  `
})
```

### Dark Theme

```typescript
@Component({
  template: `
    <coar-menu theme="dark">
      <coar-menu-item title="Dark theme item" />
    </coar-menu>
  `
})
```

### Context Menu (with CoarOverlayService)

For right-click context menus, combine with `@cocoar/ui-overlay`:

```typescript
import { CoarOverlayService, Overlay } from '@cocoar/ui-overlay';
import { CoarMenuComponent, CoarMenuItemComponent } from '@cocoar/ui-components';

@Component({
  template: `
    <div (contextmenu)="onContextMenu($event)">
      Right-click me
    </div>

    <ng-template #contextMenuTemplate>
      <coar-menu mode="vertical" size="sm" ariaLabel="Context menu">
        <coar-menu-item icon="scissors" title="Cut" (clicked)="onCut()" />
        <coar-menu-item icon="copy" title="Copy" (clicked)="onCopy()" />
        <coar-menu-item icon="clipboard" title="Paste" (clicked)="onPaste()" />
      </coar-menu>
    </ng-template>
  `
})
export class MyComponent {
  overlayService = inject(CoarOverlayService);
  contextMenuTemplate = viewChild<TemplateRef>('contextMenuTemplate');

  onContextMenu(event: MouseEvent) {
    event.preventDefault();

    const template = this.contextMenuTemplate();
    if (!template) return;

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromTemplate(template));
      b.anchor({ kind: 'point', x: event.clientX, y: event.clientY });
      b.position({ placement: 'bottom-start' });
      b.dismiss({ outsideClick: true, escapeKey: true });
    });

    this.overlayService.open(spec, {});
  }

  onCut() { /* implementation */ }
  onCopy() { /* implementation */ }
  onPaste() { /* implementation */ }
}
```

## Styling

The menu components use CSS custom properties (design tokens) for theming:

### Background & Text
- `--coar-background-neutral-primary` - Menu background
- `--coar-background-neutral-secondary` - Submenu background
- `--coar-background-neutral-tertiary` - Hover state
- `--coar-text-neutral-primary` - Default text color
- `--coar-text-accent-primary` - Selected item text

### Borders & Icons
- `--coar-border-neutral-tertiary` - Divider and submenu borders
- `--coar-icon-neutral-primary` - Default icon color
- `--coar-icon-accent-primary` - Selected item icon

### Spacing & Typography
- `--coar-spacing-xs`, `-s`, `-m`, `-l` - Internal spacing
- `--coar-body-base-family` - Font family
- `--coar-body-small-base-size` - Default text size
- `--coar-body-caption-size` - XS variant text size

### Effects
- `--coar-shadow-m` - Menu shadow
- `--coar-radius-xs` - Border radius

## Keyboard Navigation Reference

| Key | Action |
|-----|--------|
| `↓` (ArrowDown) | Focus next item (wraps to first) |
| `↑` (ArrowUp) | Focus previous item (wraps to last) |
| `Enter` or `Space` | Activate focused item |
| `Home` | Focus first item |
| `End` | Focus last item |
| `→` (ArrowRight) | Expand focused submenu |
| `←` (ArrowLeft) | Collapse focused submenu |

**Note:** Disabled items are automatically skipped during navigation.

## Accessibility Features

✅ **ARIA Roles:** `menu`, `menuitem`, `separator`, `button`
✅ **ARIA Attributes:** `aria-disabled`, `aria-selected`, `aria-expanded`, `aria-haspopup`, `aria-label`, `aria-orientation`
✅ **Keyboard Navigation:** Full arrow key + Enter/Space support
✅ **Focus Management:** Roving tabindex, focus-visible styles
✅ **Screen Readers:** Proper announcements for state changes
✅ **Disabled States:** Items are skipped and announced as disabled

## Migration from Basic Version

If you're using the initial menu component, update:

```diff
- <coar-menu mode="vertical" theme="light">
+ <coar-menu mode="vertical" theme="light" size="md" ariaLabel="Main menu">

- <coar-menu-submenu title="Settings" [defaultOpen]="true">
+ <coar-menu-submenu title="Settings" [defaultOpen]="false">
  ^^^^ Bug fix: defaultOpen now works correctly
```

## Roadmap / Future Improvements

- [x] ~~Keyboard navigation (Arrow keys, Home/End)~~
- [x] ~~Full accessibility (ARIA roles, focus management)~~
- [x] ~~Size variants (xs, sm, md, lg)~~
- [x] ~~Design token alignment~~
- [ ] Menu item checkboxes/radios
- [ ] Icons on the right side
- [ ] Horizontal submenu positioning
- [ ] Menu groups/sections with headers
- [ ] Animation/transition customization
- [ ] Virtual scrolling for large menus
