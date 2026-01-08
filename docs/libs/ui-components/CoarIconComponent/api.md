# CoarIconComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

COAR Icon Component
Icon component supporting DI-provided icon registries.
Usage:
**Example :**`<coar-icon name="settings" size="md"></coar-icon>`Size tokens:

- xs = 12px

- sm = 16px

- md = 20px (default)

- lg = 24px

- xl = 32px

- auto = fills parent container (use padding on parent to control)

## Selector

```html
<coar-icon></coar-icon>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `color` | `string` | `'inherit'` | - | Icon color. Can be any valid CSS color value. Examples: 'red', '#ff0000', 'rgb(255, 0, 0)', 'var(--coar-text-semantic-error-bold)' Use 'inherit' to inherit the parent element's color. |
| `label` | `string \| number` | - | - | Optional text label to display next to the icon. |
| `name` | `string` | - | - | Icon identifier. Examples: "settings", "user" |
| `rotate` | `number` | `0` | - | Rotation angle in degrees (0, 90, 180, 270, or any number). |
| `rotateTransition` | `number \| string` | - | - | Rotation transition animation.  - Empty/undefined: No animation  - Number: Duration in milliseconds (e.g., 300)  - String: Full CSS transition value (e.g., '0.3s ease-in-out', '500ms cubic-bezier(0.4, 0, 0.2, 1)') |
| `size` | `CoarIconSize \| string` | `'md'` | - | Icon size. Defaults to 'md' (20px). Can be a preset token (xs, sm, md, lg, xl, auto) or a custom CSS value (e.g., '42px', '3rem'). |
| `source` | `string \| undefined` | - | - | Optional icon source key.  - If omitted, the default source is used.  - If multiple sources are registered, this can be used to target a specific one. |
| `spin` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Enable continuous spinning animation. |
