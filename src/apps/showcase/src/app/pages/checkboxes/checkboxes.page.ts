import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarCheckboxComponent,
  CoarCheckboxState,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarTableComponent,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-checkboxes',
  standalone: true,
  imports: [
    CommonModule,
    CoarCheckboxComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarTableComponent,
  ],
  templateUrl: './checkboxes.page.html',
  styleUrl: './checkboxes.page.css',
})
export class CheckboxesPage {
  activeTab = 'examples';

  // Demo values - now using CoarCheckboxState
  basicChecked = signal<CoarCheckboxState | undefined>(undefined);
  termsChecked = signal<CoarCheckboxState | undefined>(undefined);
  newsletterChecked = signal<CoarCheckboxState | undefined>('checked');
  errorChecked = signal<CoarCheckboxState | undefined>(undefined);
  hintChecked = signal<CoarCheckboxState | undefined>(undefined);
  sizeXsChecked = signal<CoarCheckboxState | undefined>('checked');
  sizeSmChecked = signal<CoarCheckboxState | undefined>('checked');
  sizeMdChecked = signal<CoarCheckboxState | undefined>('checked');
  sizeLgChecked = signal<CoarCheckboxState | undefined>('checked');

  // Group demo
  selectedFruits = signal<string[]>(['apple']);

  parentCheckboxState = computed<CoarCheckboxState>(() => {
    const count = this.selectedFruits().length;
    if (count === 0) return 'unchecked';
    if (count === this.fruits.length) return 'checked';
    return 'indeterminate';
  });

  // API properties
  apiProperties = [
    {
      name: 'label',
      type: 'string',
      default: "''",
      description: 'Label text displayed next to the checkbox',
    },
    {
      name: 'checked',
      type: 'CoarCheckboxState | undefined',
      default: 'undefined',
      description:
        "Checkbox state: 'checked', 'unchecked', 'indeterminate', or undefined (pristine)",
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the checkbox (greyed out, not focusable)',
    },
    {
      name: 'readonly',
      type: 'boolean',
      default: 'false',
      description: 'Prevents changes but keeps normal appearance and focus',
    },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      description: 'Marks as required, shows asterisk',
    },
    { name: 'error', type: 'string', default: "''", description: 'Error message to display' },
    {
      name: 'hint',
      type: 'string',
      default: "''",
      description: 'Hint text displayed below checkbox',
    },
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Checkbox size, matches input/button heights',
    },
    { name: 'id', type: 'string', default: 'auto', description: 'HTML id attribute' },
    {
      name: 'name',
      type: 'string',
      default: "''",
      description: 'HTML name attribute for form submission',
    },
    {
      name: 'value',
      type: 'string',
      default: "''",
      description: 'Value submitted with form when checked',
    },
  ];

  apiOutputs = [
    {
      name: 'checkedChange',
      type: 'CoarCheckboxState',
      description: "Emitted when state changes: 'checked' or 'unchecked'",
    },
  ];

  // Code examples
  codeExamples = {
    basic: `<coar-checkbox
  label="I agree to the terms"
  [checked]="state()"
  (checkedChange)="state.set($event)"
/>`,

    checked: `<coar-checkbox
  label="Subscribe to newsletter"
  checked="checked"
/>`,

    indeterminate: `// Compute parent state based on children
parentState = computed(() => {
  if (allSelected()) return 'checked';
  if (someSelected()) return 'indeterminate';
  return 'unchecked';
});

<coar-checkbox
  label="Select all"
  [checked]="parentState()"
  (checkedChange)="toggleAll($event)"
/>`,

    required: `<coar-checkbox
  label="Accept terms and conditions"
  [required]="true"
  [checked]="state()"
  (checkedChange)="state.set($event)"
/>`,

    error: `<coar-checkbox
  label="Accept terms and conditions"
  [required]="true"
  error="You must accept the terms to continue"
/>`,

    disabled: `<coar-checkbox label="Disabled unchecked" [disabled]="true" />
<coar-checkbox label="Disabled checked" [disabled]="true" checked="checked" />`,

    readonly: `<coar-checkbox label="Readonly unchecked" [readonly]="true" checked="unchecked" />
<coar-checkbox label="Readonly checked" [readonly]="true" checked="checked" />`,

    hint: `<coar-checkbox
  label="Send me product updates"
  hint="We'll only send relevant information, no spam"
/>`,

    sizes: `<coar-checkbox size="xs" label="Extra small checkbox" />
<coar-checkbox size="sm" label="Small checkbox" />
<coar-checkbox size="md" label="Medium checkbox (default)" />
<coar-checkbox size="lg" label="Large checkbox" />`,

    group: `// Parent state computed from children
parentState = computed<CoarCheckboxState>(() => {
  const count = selectedFruits().length;
  if (count === 0) return 'unchecked';
  if (count === fruits.length) return 'checked';
  return 'indeterminate';
});

<coar-checkbox
  label="Select all fruits"
  [checked]="parentState()"
  (checkedChange)="toggleAll($event)"
/>

<coar-checkbox
  label="Apple"
  [checked]="isFruitSelected('apple') ? 'checked' : 'unchecked'"
  (checkedChange)="toggleFruit('apple', $event)"
/>`,
  };

  // Group logic
  fruits = ['apple', 'banana', 'orange'];

  getFruitState(fruit: string): CoarCheckboxState {
    return this.selectedFruits().includes(fruit) ? 'checked' : 'unchecked';
  }

  toggleFruit(fruit: string, state: CoarCheckboxState | undefined): void {
    const current = this.selectedFruits();
    if (state === 'checked') {
      this.selectedFruits.set([...current, fruit]);
    } else {
      this.selectedFruits.set(current.filter((f) => f !== fruit));
    }
  }

  toggleAllFruits(state: CoarCheckboxState | undefined): void {
    if (state === 'checked') {
      this.selectedFruits.set([...this.fruits]);
    } else {
      this.selectedFruits.set([]);
    }
  }
}
