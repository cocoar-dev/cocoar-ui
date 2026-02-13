# Sidebar

A three-part navigation sidebar with header, scrollable content, and footer sections.

## Basic Usage

The simplest sidebar with a menu:

```html
<coar-sidebar>
  <coar-menu borderless>
    <coar-menu-item>Dashboard</coar-menu-item>
    <coar-menu-item>Projects</coar-menu-item>
    <coar-menu-item>Settings</coar-menu-item>
  </coar-menu>
</coar-sidebar>
```

## Content Projection

The sidebar uses attribute selectors for three distinct sections:

### Header Section
Fixed at the top. Use for branding, logos, or titles:

```html
<coar-sidebar>
  <div coar-sidebar-header>
    <h2>My Application</h2>
  </div>

  <!-- content... -->
</coar-sidebar>
```

### Content Section (Default)
Scrollable main area. Any content without `coar-sidebar-header` or `coar-sidebar-footer` goes here:

```html
<coar-sidebar>
  <coar-menu borderless>
    <coar-menu-item>Dashboard</coar-menu-item>
    <coar-menu-item>Settings</coar-menu-item>
  </coar-menu>
</coar-sidebar>
```

### Footer Section
Fixed at the bottom. Use for actions, user info, or settings:

```html
<coar-sidebar>
  <!-- content... -->

  <div coar-sidebar-footer>
    <coar-button variant="ghost">Logout</coar-button>
  </div>
</coar-sidebar>
```

## Complete Example

All three sections together:

```html
<coar-sidebar>
  <!-- Fixed header -->
  <div coar-sidebar-header>
    <div style="display: flex; align-items: center; gap: 12px;">
      <coar-icon name="logo" size="32"></coar-icon>
      <h2>Dashboard</h2>
    </div>
  </div>

  <!-- Scrollable content -->
  <coar-menu borderless>
    <coar-menu-heading>Main</coar-menu-heading>
    <coar-menu-item routerLink="/dashboard">Dashboard</coar-menu-item>
    <coar-menu-item routerLink="/projects">Projects</coar-menu-item>
    <coar-menu-item routerLink="/team">Team</coar-menu-item>

    <coar-menu-divider></coar-menu-divider>

    <coar-menu-heading>Settings</coar-menu-heading>
    <coar-menu-item routerLink="/settings/profile">Profile</coar-menu-item>
    <coar-menu-item routerLink="/settings/preferences">Preferences</coar-menu-item>
  </coar-menu>

  <!-- Fixed footer -->
  <div coar-sidebar-footer>
    <div style="padding: 8px;">
      <strong>John Doe</strong>
      <div style="font-size: 12px; color: var(--coar-text-neutral-tertiary);">
        john@example.com
      </div>
    </div>
  </div>
</coar-sidebar>
```

## Menu Integration

The sidebar is designed to work with `CoarMenuComponent` in **borderless mode**:

```html
<coar-sidebar>
  <coar-menu borderless>
    <coar-menu-item>Dashboard</coar-menu-item>
    <coar-menu-item>Settings</coar-menu-item>
  </coar-menu>
</coar-sidebar>
```

The `borderless` input removes the menu's default border and background, making it blend seamlessly with the sidebar.

### Menu Styling

When used inside the sidebar, menu components receive custom styling:

- **Items**: Grey background on hover/active (no borders)
- **Expanded submenus**: Vertical line on the left side
- **Spacing**: Reduced padding and margins for compact layout
- **Active state**: Works with Angular Router's `routerLinkActive`

All menu styling is built into the sidebar component—no additional CSS needed.

## Positioning

Sidebars can be positioned on the left (default) or right side:

```html
<!-- Left sidebar (default) -->
<coar-sidebar>
  <coar-menu borderless>
    <coar-menu-item>Home</coar-menu-item>
  </coar-menu>
</coar-sidebar>

<!-- Right sidebar -->
<coar-sidebar position="right">
  <coar-menu borderless>
    <coar-menu-item>Help</coar-menu-item>
  </coar-menu>
</coar-sidebar>
```

## Collapsed State

Use the `collapsed` attribute for a narrow icon-only sidebar (4rem width):

```html
<coar-sidebar collapsed>
  <coar-menu borderless>
    <coar-menu-item>🏠</coar-menu-item>
    <coar-menu-item>📁</coar-menu-item>
    <coar-menu-item>⚙️</coar-menu-item>
  </coar-menu>
</coar-sidebar>
```

You can bind this to a toggle for expandable/collapsible behavior:

```typescript
export class AppComponent {
  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
```

```html
<coar-sidebar [collapsed]="isCollapsed">
  <!-- content -->
</coar-sidebar>
```

## Router Integration

Use Angular Router's `routerLink` and `routerLinkActive` for navigation:

```html
<coar-sidebar>
  <coar-menu borderless>
    <coar-menu-item
      routerLink="/dashboard"
      routerLinkActive="active">
      Dashboard
    </coar-menu-item>
    <coar-menu-item
      routerLink="/settings"
      routerLinkActive="active">
      Settings
    </coar-menu-item>
  </coar-menu>
</coar-sidebar>
```

The `.active` class applies grey background to the current route automatically.

## Custom Content

The sidebar can contain any content, not just menus:

```html
<coar-sidebar>
  <div coar-sidebar-header>
    <h3>Filters</h3>
  </div>

  <div style="padding: 16px;">
    <label>
      <input type="checkbox"> Show archived
    </label>
    <label>
      <input type="checkbox"> Show drafts
    </label>
  </div>

  <div coar-sidebar-footer>
    <coar-button variant="primary" size="s">Apply</coar-button>
  </div>
</coar-sidebar>
```

## Design Tokens

Override CSS variables to customize the sidebar:

```css
coar-sidebar {
  --coar-sidebar-width: 20rem; /* Wider sidebar */
  --coar-sidebar-background: #f5f5f5; /* Custom background */
}
```
