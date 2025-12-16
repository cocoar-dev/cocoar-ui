# Tabs API

Tabs are composed of two components:

- `coar-tab-group` (container)
- `coar-tab` (tab definition)

## CoarTabGroup

### Selector

```html
<coar-tab-group></coar-tab-group>
```

### Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `activeTab` | `string` | `''` | The id of the active tab. If empty, the first tab is selected after content init. |

### Outputs

| Name | Type | Description |
| --- | --- | --- |
| `activeTabChange` | `string` | Emits when a new tab is selected (click or keyboard). |

## CoarTab

### Selector

```html
<coar-tab></coar-tab>
```

### Types

- `TabLoadingStrategy = 'eager' | 'lazy'`
- `TabContent = TemplateRef<unknown> | Type<unknown>`

### Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | (required) | Unique identifier for the tab. |
| `content` | `TabContent` | (required) | Content for the tab panel: either an `ng-template` reference or a Component class. |
| `disabled` | `boolean` | `false` | Disables the tab button and prevents selection. Supports boolean attribute usage. |
| `loadingStrategy` | `TabLoadingStrategy` | `'lazy'` | `'lazy'` renders content only when active; `'eager'` always renders content. |
| `contentInputs` | `Record<string, unknown>` | `{}` | Inputs passed to the Component when `content` is a Component. Ignored for templates. |

### Content projection

- Default projection (component content) is used as the **tab label**.

## Accessibility

- The tab list uses `role="tablist"`.
- Each tab is a native `<button>` with `role="tab"` and `aria-selected`.
- Each panel uses `role="tabpanel"` and is linked via `aria-controls` / `aria-labelledby`.
- Disabled tabs use native `disabled` on the button.

## CSS tokens used

The components use design tokens (CSS variables), including:

- Spacing: `--coar-spacing-s`, `--coar-spacing-m`, `--coar-spacing-l`, `--coar-spacing-xl`
- Radius: `--coar-radius-xs`
- Typography: `--coar-body-base-family`, `--coar-body-small-base-size`
- Colors/borders: `--coar-border-neutral-tertiary`, `--coar-border-accent-primary`, `--coar-text-neutral-secondary`, `--coar-text-neutral-disabled`, `--coar-text-accent-primary`
