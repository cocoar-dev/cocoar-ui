# Form Patterns

Form patterns and layouts demonstrating how input components work together.

## Use Reactive Forms

Prefer Angular Reactive Forms (`FormGroup`, `FormControl`) for consistency and validation.

## Size Alignment

Input sizes match button sizes for consistent form layouts.

- Use the same `size` for inputs, checkboxes, and buttons when they sit on the same row.
- Default `md` size is a safe choice for most forms.

### Height reference

| Size | Typical use | Height |
| --- | --- | --- |
| `xs` | Inline actions | 27px |
| `sm` | Compact UI | 32px |
| `md` | Default | 40px |
| `lg` | Prominent actions | 48px |

## Best Practices

- Always use the same size for inputs and buttons in inline forms.
- Use `sm` for compact UI like toolbars or dense tables.
- Use `md` (default) for most forms and dialogs.
- Use `lg` for prominent forms (login/hero sections).
- Required fields: use the component’s `required` input so the UI and accessibility metadata are correct.

## Example Patterns

### Login form

- Use `type="submit"` on the primary action button.
- Disable and/or set `loading` while submitting to prevent double submits.

### Inline single-field form

- Keep both input and button at `size="sm"` (or the same size you choose).
- Use `fullWidth` buttons only when the layout calls for it.
