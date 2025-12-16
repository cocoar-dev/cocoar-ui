# Label API

## Selector

```html
<coar-label></coar-label>
```

## Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Size of the label. Should match the size of the associated component. |
| `required` | `boolean` | `false` | Shows a required indicator (`*`) after the label text. |
| `for` | `string \| undefined` | `undefined` | Sets the `for` attribute on the host element. |

## Outputs

None.

## Host Classes

The component always applies `coar-label`.

Depending on `size`, one of these modifier classes is also applied:

- `coar-label--xs`
- `coar-label--sm`
- `coar-label--md`
- `coar-label--lg`

## CSS Tokens Used

The component styling uses these CSS variables:

- Typography: `--coar-body-small-bold-family`, `--coar-body-small-bold-weight`
- Text color: `--coar-text-neutral-primary`
- Size font sizes: `--coar-component-xs-label-font-size`, `--coar-component-sm-label-font-size`, `--coar-component-md-label-font-size`, `--coar-component-lg-label-font-size`
- Required indicator: `--coar-text-semantic-error-bold`, `--coar-spacing-xs`
