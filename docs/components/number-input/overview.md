# Number Input

`<coar-number-input>` is a form-ready numeric input with optional stepper buttons, min/max constraints, prefix/suffix, and locale-aware formatting.

## When to use

- Numeric values (quantity, price, percentage)
- Values with boundaries (`min` / `max`)
- Values with specific increments (`step`) and precision (`decimals`)

## Basic

```html
<coar-number-input
  stepperButtons
  label="Quantity"
  placeholder="Enter amount"
  [value]="quantity"
  (valueChange)="quantity = $event"
/>
```

## Currency / Precision

```html
<coar-number-input
  stepperButtons
  label="Price"
  [decimals]="2"
  [step]="0.01"
  suffix="EUR"
  [value]="price"
  (valueChange)="price = $event"
/>
```

## Number Formatting

You can control separators via `numberFormat`.

```html
<coar-number-input
  label="Preis (DE)"
  [decimals]="2"
  [numberFormat]="{ decimal: ',', thousand: '.' }"
  suffix="EUR"
  [value]="germanPrice"
  (valueChange)="germanPrice = $event"
/>
```

## Forms

The component implements Angular Control Value Accessor, so it can be used with template-driven forms and reactive forms.
