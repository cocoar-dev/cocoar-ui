# Radio Group

Radio buttons allow users to select exactly one option from a set. Use radio groups when users need to see all available options and make a mutually exclusive choice.

## Basic Usage

Wrap `coar-radio` components inside a `coar-radio-group` with a unique `name`.

```html
<coar-radio-group name="options" [(ngModel)]="selectedOption">
  <coar-radio value="option1">Option 1</coar-radio>
  <coar-radio value="option2">Option 2</coar-radio>
  <coar-radio value="option3">Option 3</coar-radio>
</coar-radio-group>
```

## Orientation

Display options vertically (default) or horizontally.

```html
<!-- Vertical (default) -->
<coar-radio-group name="vertical-demo" orientation="vertical">
  <coar-radio value="a">Option A</coar-radio>
  <coar-radio value="b">Option B</coar-radio>
</coar-radio-group>

<!-- Horizontal -->
<coar-radio-group name="horizontal-demo" orientation="horizontal">
  <coar-radio value="a">Option A</coar-radio>
  <coar-radio value="b">Option B</coar-radio>
</coar-radio-group>
```

## Disabled States

Disable the entire group or individual options.

```html
<!-- Entire group disabled -->
<coar-radio-group name="disabled-group" [disabled]="true">
  <coar-radio value="a">Option A</coar-radio>
  <coar-radio value="b">Option B</coar-radio>
</coar-radio-group>

<!-- Single option disabled -->
<coar-radio-group name="partial-disabled">
  <coar-radio value="a">Available</coar-radio>
  <coar-radio value="b" [disabled]="true">Unavailable</coar-radio>
</coar-radio-group>
```

## Rich Content

Radio labels can contain any content, not just text.

```html
<coar-radio-group name="plans" [(ngModel)]="selectedPlan">
  <coar-radio value="free">
    <strong>Free Plan</strong>
    <p>5 projects, 1GB storage</p>
  </coar-radio>
  <coar-radio value="pro">
    <strong>Pro Plan</strong>
    <p>Unlimited projects, 100GB storage</p>
  </coar-radio>
</coar-radio-group>
```

## Reactive Forms

Works with Angular reactive forms.

```html
<coar-radio-group name="form-options" [formControl]="optionControl">
  <coar-radio value="a">Option A</coar-radio>
  <coar-radio value="b">Option B</coar-radio>
</coar-radio-group>
```

## Accessibility

- Use arrow keys (↑↓ for vertical, ←→ for horizontal) to navigate between options
- Press Space to select the focused option
- Tab moves focus to/from the radio group
- Each radio button is properly labeled and announces its state
