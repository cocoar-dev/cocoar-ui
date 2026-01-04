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
| `name` | `string` | `undefined` | Icon identifier in the selected source. |
| `source` | `string \| undefined` | `undefined` | Optional icon source key. If omitted, the default source is used. |
| `size` | `CoarIconSize \| string` | `'md'` | Preset token (`'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'auto'`) or custom CSS value (e.g. `'42px'`, `'3rem'`). |
| `rotate` | `number` | `0` | Rotation angle in degrees. |
| `rotateTransition` | `number \| string` | `undefined` | Transition for rotation: ms duration (number) or a CSS transition value. |
| `spin` | `boolean` | `false` | Enables continuous spinning animation. |
| `color` | `string` | `'inherit'` | Any valid CSS color value (including CSS variables). |
| `label` | `string \| number` | `undefined` | Optional text label displayed next to the icon. |

## Content

If `label` is not set, projected content is rendered in the label span:

```html
<coar-icon name="settings">Settings</coar-icon>
```

## Outputs

None.

## Related exports

```ts
import {
	CoarIconService,
	provideCoarIconSource,
	provideCoarIconMapSource,
	provideCoarHttpIconSource,
	provideCoarIconBuiltInOverrides,
	provideCoarDefaultIconSource,
} from '@cocoar/ui-components';
```

## Implementation notes

- Built-in icons are always available under the fixed source key `coar-builtin`.
- The default source is `coar-builtin` unless overridden with `provideCoarDefaultIconSource(key)` (last one wins).
- Consumers can override the built-in icons by providing their own source using the same key (`coar-builtin`).
- Consumers can override the built-in icons by providing their own source using the same key (`coar-builtin`).
- For partial overrides (merge), use `provideCoarIconBuiltInOverrides({ ... })`.

## Icon source introspection

To build icon pickers / UIs, `CoarIconService` can list registered sources and (when supported) list the available icon keys per source:

- `getRegisteredSources()` returns `[{ key, isDefault, canProvideIconKeys }, ...]`.
- `getAvailableIconKeys(sourceKey?)` returns `Observable<readonly string[]>` and throws if that source cannot list keys.

## Styling

- Icons render with `fill: currentColor` so they inherit text color.
- Label spacing uses `--coar-spacing-xs`.
