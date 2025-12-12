# Forms status (important)

Goal: make it safe for assistants and developers to build forms without guessing.

## Status

- ✅ Repo builds / tests / CI are green.
- ✅ Components exist and are usable as standalone Angular components.
- ✅ **`ControlValueAccessor` integration exists** for:
   - `coar-text-input`
   - `coar-password-input`
   - `coar-number-input`
- ❌ **No Signal Forms integration yet** (Angular 21 feature).

## What this means for consumers

You can bind the supported Coar inputs via `formControlName` / `[formControl]` and `[(ngModel)]`.

Other components may still not support forms APIs yet (check the component reference and tests).

### Recommended approach

- Prefer Reactive Forms (`FormControl`, `FormGroup`) for complex forms.
- Use Coar inputs where CVA is implemented.
- For controls that still lack CVA, use native form controls temporarily.

## Next implementation milestones

1) Expand CVA coverage to other form controls (e.g. checkbox, select, etc.).
3) Provide a small set of reference recipes:
   - login form
   - validation messages
   - disabled / loading / submit

## Guidance for AI assistants

When asked to build a login form with Coar:
- Use Reactive Forms with `coar-text-input` and `coar-password-input`.
- Use native inputs only when a required Coar control does not support CVA yet.
