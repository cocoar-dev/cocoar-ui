# Coar Menu

Menu building blocks from `@cocoar/ui-components`.

Use them inline, or inside `@cocoar/ui-overlay` for context menus and nested flyout submenus.

## Components

### `CoarMenuComponent` (`coar-menu`)

Container for menu items. Also hosts “menu-aim” configuration inputs (delayed switching between sibling submenus).

**Inputs (menu-aim):**
- `aimEnabled?: boolean` (default `true`)
- `aimDebugEnabled?: boolean` (default `false`, for showcase/debugging)
- `aimSwitchDelayMs?: number` (default `500`)
- `aimSampleMaxAgeMs?: number` (default `200`)

### `CoarMenuItemComponent` (`coar-menu-item`)

Action item.

**Inputs:**
- `icon?: CoreIconName`
- `label?: string` (optional; you can also project the text as content)
- `disabled?: boolean` (default `false`)

**Outputs:**
- `itemClick: void`

### `CoarSubmenuItemComponent` (`coar-submenu-item`)

Menu item that opens a flyout submenu.

Also available via the alias selector `coar-sub-flyout` (recommended for new usage).

**Inputs:**
- `label: string` (required)
- `icon?: CoreIconName`
- `disabled?: boolean` (default `false`)
- `submenuTemplate?: TemplateRef<unknown> | null` (optional fallback)

Submenu content can be authored either:
- Inline via a direct child `<ng-template>` (recommended), or
- As an external `<ng-template #ref>` passed into `[submenuTemplate]`.

### `CoarSubAccordionComponent` (`coar-sub-accordion`)

Menu item that expands/collapses a submenu inline.

**Inputs:**
- `label: string` (required)
- `icon?: CoreIconName`
- `disabled?: boolean` (default `false`)
- `open?: boolean` (default `false`, two-way bindable with `[(open)]`)
- `submenuTemplate?: TemplateRef<unknown> | null` (optional fallback)

### `CoarMenuDividerComponent` (`coar-menu-divider`)

Visual separator.

## Usage

### Basic Menu

```html
<coar-menu>
  <coar-menu-item icon="plus" (itemClick)="onCreate()">Create</coar-menu-item>
  <coar-menu-item icon="copy" (itemClick)="onDuplicate()">Duplicate</coar-menu-item>
  <coar-menu-divider />
  <coar-menu-item icon="trash" (itemClick)="onDelete()">Delete</coar-menu-item>
</coar-menu>
```

### Flyout Submenu (inline `<ng-template>`)

```html
<coar-menu>
  <coar-sub-flyout label="Share" icon="users">
    <ng-template>
      <coar-menu>
        <coar-menu-item (itemClick)="shareEmail()">Email</coar-menu-item>
        <coar-menu-item (itemClick)="shareCopyLink()">Copy link</coar-menu-item>

        <coar-sub-flyout label="Social" icon="share">
          <ng-template>
            <coar-menu>
              <coar-menu-item>Twitter</coar-menu-item>
              <coar-menu-item>LinkedIn</coar-menu-item>
            </coar-menu>
          </ng-template>
        </coar-sub-flyout>
      </coar-menu>
    </ng-template>
  </coar-sub-flyout>
</coar-menu>
```

### Flyout Submenu (external template)

```html
<coar-menu>
  <coar-sub-flyout label="Share" icon="users" [submenuTemplate]="shareMenu" />
</coar-menu>

<ng-template #shareMenu>
  <coar-menu>
    <coar-menu-item>Email</coar-menu-item>
    <coar-menu-item>Copy link</coar-menu-item>
  </coar-menu>
</ng-template>
```

### Accordion Submenu (inline)

```html
<coar-menu>
  <coar-sub-accordion label="Options" icon="settings" [(open)]="optionsOpen">
    <ng-template>
      <coar-menu-item icon="plus" (itemClick)="onAdd()">Add</coar-menu-item>
      <coar-menu-item icon="trash" (itemClick)="onClear()">Clear</coar-menu-item>
    </ng-template>
  </coar-sub-accordion>
</coar-menu>
```

### Context Menu (with `@cocoar/ui-overlay`)

```typescript
import { Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { CoarOverlayService, Overlay, coarMenuPreset } from '@cocoar/ui-overlay';

@Component({
  template: `
    <div (contextmenu)="onContextMenu($event)">Right-click me</div>

    <ng-template #contextMenuTemplate>
      <coar-menu>
        <coar-menu-item icon="copy" (itemClick)="onCopy()">Copy</coar-menu-item>
        <coar-menu-item icon="clipboard" (itemClick)="onPaste()">Paste</coar-menu-item>
        <coar-menu-divider />
        <coar-menu-item icon="trash" (itemClick)="onDelete()">Delete</coar-menu-item>
      </coar-menu>
    </ng-template>
  `,
})
export class MyComponent {
  private readonly overlayService = inject(CoarOverlayService);

  @ViewChild('contextMenuTemplate') contextMenuTemplate!: TemplateRef<unknown>;

  private contextMenuRef: ReturnType<typeof this.overlayService.open> | null = null;

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();

    this.contextMenuRef?.close();

    const spec = Overlay.define<void>((b) => {
      b.content((c) => c.fromTemplate(this.contextMenuTemplate));
      b.anchor({ kind: 'point', x: event.clientX, y: event.clientY });
      b.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true });
    }, coarMenuPreset);

    this.contextMenuRef = this.overlayService.open(spec, undefined);
  }

  onCopy(): void {
    this.contextMenuRef?.close();
  }
  onPaste(): void {
    this.contextMenuRef?.close();
  }
  onDelete(): void {
    this.contextMenuRef?.close();
  }
}
```

## More docs

- Component docs live under `docs/components/menu/*` in this repo.
