# Multi Select

Selector: `<coar-multi-select>`

Use this component when a user can choose **multiple** options from a list.

## Basic usage

```html
<coar-multi-select
  label="Skills"
  placeholder="Select skills..."
  [options]="skillOptions"
  [(value)]="selectedSkills"
/>
```

## Search + "Select All"

```html
<coar-multi-select
  label="Skills"
  [options]="skillOptions"
  [(value)]="selectedSkills"
  [searchable]="true"
  searchPlaceholder="Filter skills..."
  [showSelectAll]="true"
/>
```

## Display truncation

Use `maxDisplayItems` to limit the number of labels shown before switching to `"N selected"`.

```html
<coar-multi-select
  label="Skills"
  [options]="skillOptions"
  [(value)]="selectedSkills"
  [maxDisplayItems]="2"
/>
```

## Forms

The component implements Angular `ControlValueAccessor` and works with reactive forms.

**Reactive Forms:**
```ts
import { FormControl } from '@angular/forms';

interface Skill {
  id: number;
  name: string;
}

skills = new FormControl<Skill[]>([]);
```

```html
<coar-multi-select
  label="Skills"
  [options]="skillOptions"
  [formControl]="skills"
/>
```

See [forms-status.md](../../recipes/forms-status.md) for complete form control support.
