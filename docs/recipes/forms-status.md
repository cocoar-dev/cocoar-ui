# Forms status (important)

Goal: make it safe for assistants and developers to build forms without guessing.

## Status

- ✅ Repo builds / tests / CI are green.
- ✅ Components exist and are usable as standalone Angular components.
- ❌ **No `ControlValueAccessor` integration yet** for input-like components.
- ❌ **No Signal Forms integration yet** (Angular 21 feature).

## What this means for consumers

Right now, Coar input-like components cannot be bound via `formControlName` or `[(ngModel)]`.

### Recommended temporary approach

- Use native HTML form controls (`<input>`, `<select>`, `<textarea>`) for data entry.
- Use Coar components for layout + presentation (cards, buttons, etc.).
- When CVA is added, migrate the native controls to Coar controls.

## Next implementation milestones

1) Pick the primary forms approach for Angular 20 consumers:
   - `ControlValueAccessor` (Reactive Forms) is the standard.
2) Implement CVA for `coar-input` (and any other input-like controls).
3) Provide a small set of reference recipes:
   - login form
   - validation messages
   - disabled / loading / submit

## Guidance for AI assistants

When asked to build a login form with Coar:
- Do **not** use `formControlName` with Coar inputs until CVA exists.
- Prefer native inputs + Coar button/card.
