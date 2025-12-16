# Icon API

## Selector

`coar-icon`

## Import

```ts
import { CoarIconComponent } from '@cocoar/ui-components';
```

## Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `CoreIconName` | `undefined` | Icon identifier (built-in key like `"settings"` or namespaced `"customer:…"`). |
| `size` | `CoarIconSize \| string` | `'md'` | Preset token (`'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'auto'`) or custom CSS value (e.g. `'42px'`, `'3rem'`). |
| `rotate` | `number` | `0` | Rotation angle in degrees. |
| `rotateTransition` | `number \| string` | `undefined` | Transition for rotation: ms duration (number) or a CSS transition value. |
| `spin` | `boolean` | `false` | Enables continuous spinning animation. |
| `color` | `string` | `'inherit'` | Any valid CSS color value (including CSS variables). |
| `label` | `string \| number` | `undefined` | Optional text label displayed next to the icon. |
| `fallback` | `string` | `undefined` | Fallback icon name to try if the main icon fails to load. |

## Content

If `label` is not set, projected content is rendered in the label span:

```html
<coar-icon name="settings">Settings</coar-icon>
```

## Outputs

None.

## Related exports

```ts
import { CORE_ICONS, CoarIconService } from '@cocoar/ui-components';
```

## Implementation notes

- Built-in icons are generated into `CORE_ICONS` from SVG files under `assets/icons`.
- Regenerate the registry with `pnpm run build:icons`.
- Customer icons are fetched from `/api/icons/<key>.svg` when using the `customer:` prefix.

## Styling

- Icons render with `fill: currentColor` so they inherit text color.
- Label spacing uses `--coar-spacing-xs`.
