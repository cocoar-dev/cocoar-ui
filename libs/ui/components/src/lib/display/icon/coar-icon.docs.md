# Icons

The `coar-icon` component renders an SVG icon from a DI-provided icon source.

Built-in icons are always available via the fixed source key `coar-builtin`.

Icons inherit the current text color by default and can be sized using preset tokens or custom CSS size values.

## Import

```ts
import { CoarIconComponent } from '@cocoar/ui/components';
```

## Configure sources

You can add additional sources in your app (HTTP, map-based, etc.) and choose the default:

```ts
import { provideCoarDefaultIconSource, provideCoarIconMapSource } from '@cocoar/ui/components';

providers: [
	provideCoarIconMapSource({ key: 'app-icons', icons: { /* ... */ } }),
	provideCoarDefaultIconSource('app-icons'),
];
```

To override the built-in icons, register your own source using the same key (`coar-builtin`).

## Basic usage

```html
<coar-icon name="settings" />
<coar-icon name="user" />
<coar-icon name="check" />
```

## Sizes

Preset sizes are:

- `xs` (12px)
- `sm` (16px)
- `md` (20px, default)
- `lg` (24px)
- `xl` (32px)
- `auto` (fills the parent; typically sized by the parent’s font-size / box)

```html
<coar-icon name="settings" size="xs" />
<coar-icon name="settings" size="lg" />

<!-- Custom CSS size -->
<coar-icon name="settings" size="48px" />
```

## Color

`coar-icon` uses `currentColor` in the rendered SVG, so it inherits the surrounding text color unless overridden.

```html
<coar-icon name="check" color="green" />
<coar-icon name="settings" color="var(--coar-text-accent-primary)" />
```

## Rotation and animation

```html
<!-- Rotate (degrees) -->
<coar-icon name="caret-right" [rotate]="90" />

<!-- Animate rotation changes -->
<coar-icon name="caret-right" [rotate]="isExpanded ? 90 : 0" [rotateTransition]="200" />

<!-- Spin continuously -->
<coar-icon name="load" [spin]="true" />
```

## Multiple sources

If you register more than one source, you can target one explicitly:

```html
<coar-icon name="settings" source="coar-builtin" />
```

## Browsing available icons

Some sources can provide a list of available icon keys (for example built-in icons, or an HTTP source with an index endpoint). Others cannot.

Use `CoarIconService` to build an icon picker UI:

```ts
import { CoarIconService } from '@cocoar/ui/components';

const sources = iconService.getRegisteredSources();
// -> [{ key, isDefault, canProvideIconKeys }, ...]

for (const source of sources) {
	if (!source.canProvideIconKeys) continue;
	iconService.getAvailableIconKeys(source.key).subscribe((keys) => {
		// Render keys grouped by source.key
	});
}
```

## Accessibility

`coar-icon` is purely visual by default. For accessible usage:

- Decorative icons: add `aria-hidden="true"`.
- Meaningful icons: provide an accessible name (for example via `aria-label` on the `coar-icon`, or by rendering a visible label next to it).

```html
<coar-icon name="check" aria-hidden="true" />
<coar-icon name="important" aria-label="Important" role="img" />
```
