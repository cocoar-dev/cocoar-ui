# COCOAR Icon Component (cocoar-icon)

A hybrid icon system supporting built-in icons and customer-uploaded SVGs.

## Features

- **Built-in icons**: Bundled with the app, no network requests
- **Customer icons**: Lazy-loaded from the server at runtime
- **Inline SVG**: Full CSS styling support (`fill`, `stroke`, animations)
- **Automatic caching**: Each icon is only downloaded once
- **Type-safe**: TypeScript support for built-in icon names
- **Configurable sizes**: xs, sm, md, lg, xl

## Usage

### Basic Usage

```html
<!-- Built-in icon -->
<cocoar-icon name="settings" size="md"></cocoar-icon>

<!-- Customer-uploaded icon -->
<cocoar-icon name="customer:invoicePaid" size="lg"></cocoar-icon>

<!-- With fallback -->
<cocoar-icon name="customer:brandLogo" [fallback]="'question'"></cocoar-icon>
```

### In TypeScript

```typescript
import { CoIconComponent } from '@timetodo/ui';

@Component({
  imports: [CoIconComponent]
})
export class MyComponent {}
```

## Icon Naming Convention

### Built-in Icons
- Simple name without prefix
- Examples: `settings`, `user`, `trash`, `question`

### Customer Icons
- Prefixed with `customer:`
- Examples: `customer:invoicePaid`, `customer:brandLogo`

## Size Tokens

| Size | Pixels |
|------|--------|
| xs   | 12px   |
| sm   | 16px   |
| md   | 20px   |
| lg   | 24px   |
| xl   | 32px   |

Default size is `md` (20px).

## API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `string` | required | Icon identifier |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Icon size |
| `fallback` | `string` | - | Fallback icon if main icon fails to load |

## Service API

The `CoIconService` provides programmatic access to the icon system:

```typescript
import { CoIconService } from '@timetodo/ui';

class MyComponent {
  private iconService = inject(CoIconService);
  
  loadIcon() {
    this.iconService.getIcon('settings').subscribe(svg => {
      // Returns SVG string
    });
  }
  
  clearCache() {
    // Clear all customer icon cache
    this.iconService.clearCache();
    
    // Clear specific icon
    this.iconService.clearIconCache('customer:brandLogo');
  }
}
```

## Adding New Built-in Icons

1. Add SVG files to `core-icons-src/` directory
2. Run the build script to regenerate `core-icons.ts`
3. The new icons will be available as built-in icons

Currently, built-in icons must be added manually to `core-icons.ts`.

## Customer Icon Setup

### Backend Requirements

Customer icons must be served from:
```
GET /api/icons/{iconName}.svg
```

The backend must:
- Store user-uploaded SVGs
- Sanitize SVGs upon upload (remove scripts, event handlers, etc.)
- Serve with correct content type: `image/svg+xml`
- Respect tenant isolation if multi-tenant

### Security

**Server-side sanitization is mandatory** for customer icons. Remove:
- `<script>` tags
- Event handlers (`onload`, `onclick`, etc.)
- `<foreignObject>` elements
- External resources
- CSS imports

The client uses Angular's `DomSanitizer.bypassSecurityTrustHtml()` but this should only be done after server-side sanitization.

## Caching Strategy

### Built-in Icons
- Stored in memory as constants
- No network requests
- Instant rendering

### Customer Icons
- Cached per identifier using RxJS `shareReplay(1)`
- One network request per icon (subsequent uses come from cache)
- Cache persists for the lifetime of the app
- Can be manually cleared using `CoIconService.clearCache()`

## Styling

The component applies CSS classes for size, but you can override with custom styles:

```scss
cocoar-icon {
  color: blue; // Changes fill color of SVG
  
  ::ng-deep svg {
    // Custom SVG styles
  }
}
```

## Coexistence with Legacy Icon Component

Both `ccr-icon` (FontAwesome/ng-zorro) and `cocoar-icon` (new system) can be used simultaneously during migration.

```html
<!-- Legacy -->
<ccr-icon icon="settings"></ccr-icon>

<!-- New -->
<cocoar-icon name="settings"></cocoar-icon>
```

## Architecture

Based on the [COCOAR Icon System Specification](/.local/icon-component.md).

### Key Components

1. **CoIconComponent** (`cocoar-icon`) - The UI component
2. **CoIconService** - Icon loading and caching logic
3. **core-icons.ts** - Built-in icon registry
4. **core-icons-src/** - Source SVG files (to be implemented)

## Future Enhancements

- Add build script for auto-generating `core-icons.ts` from SVG files
- Support for remote URLs (`url:https://...`)
- Icon variant support (filled/outline/duotone)
- Icon preview component for admin UIs
- Validation during upload
