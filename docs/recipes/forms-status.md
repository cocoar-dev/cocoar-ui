# Forms status (important)

Goal: make it safe for assistants and developers to build forms without guessing.

## Status

- ✅ Repo builds / tests / CI are green.
- ✅ Components exist and are usable as standalone Angular components.
- ✅ **`ControlValueAccessor` integration exists** for:
   - `coar-text-input`
   - `coar-password-input`
   - `coar-number-input`
   - `coar-checkbox`
   - `coar-date-picker`
   - `coar-single-select`
   - `coar-multi-select`
   - `coar-tag-select`
- ❌ **No Signal Forms integration yet** (available in Angular 21, integration planned).

## What this means for consumers

You can bind the supported Coar controls via `formControlName` / `[formControl]` and `[(ngModel)]`.

Other components may still not support forms APIs yet (check the component reference and tests).

### Recommended approach

- Prefer Reactive Forms (`FormControl`, `FormGroup`) for complex forms.
- Use Coar controls where CVA is implemented.
- For controls that still lack CVA, use native form controls temporarily.

## Next implementation milestones

1) ✅ CVA coverage expanded (text, password, number, checkbox, date-picker, all selects)
2) ✅ Login form reference recipe provided (see `recipes/login-form-skeleton.md`)
3) Future: Validation patterns and error handling recipes

## Guidance for AI assistants

When asked to build a login form with Coar:
- Use Reactive Forms with `coar-text-input` and `coar-password-input`.
- Use `coar-checkbox` for boolean fields.
- Use native inputs only when a required Coar control does not support CVA yet.
