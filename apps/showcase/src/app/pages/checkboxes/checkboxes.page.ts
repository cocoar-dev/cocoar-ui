import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarCheckboxComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-checkboxes',
  standalone: true,
  imports: [
    CommonModule,
    CoarCheckboxComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
  ],
  templateUrl: './checkboxes.page.html',
  styleUrl: './checkboxes.page.css',
})
export class CheckboxesPage {
  importCode = `import { CoarCheckboxComponent } from '@cocoar/ui/components';`;

  // Demo values - using boolean
  basicChecked = signal<boolean | undefined>(undefined);
  termsChecked = signal<boolean | undefined>(undefined);
  newsletterChecked = signal<boolean | undefined>(true);
  errorChecked = signal<boolean | undefined>(undefined);
  hintChecked = signal<boolean | undefined>(undefined);
  sizeXsChecked = signal<boolean | undefined>(true);
  sizeSChecked = signal<boolean | undefined>(true);
  sizeMChecked = signal<boolean | undefined>(true);
  sizeLChecked = signal<boolean | undefined>(true);

  // Group demo
  selectedFruits = signal<string[]>(['apple']);

  parentChecked = computed<boolean>(() => {
    const count = this.selectedFruits().length;
    return count === this.fruits.length;
  });

  parentIndeterminate = computed<boolean>(() => {
    const count = this.selectedFruits().length;
    return count > 0 && count < this.fruits.length;
  });

  // Code examples
  codeExamples = {
    basic: `<coar-checkbox
  label="I agree to the terms"
  [checked]="state()"
  (checkedChange)="state.set($event)"
/>`,

    checked: `<coar-checkbox
  label="Subscribe to newsletter"
  [checked]="true"
/>`,

    indeterminate: `// Compute parent checked and indeterminate states
parentChecked = computed(() => selectedFruits().length === fruits.length);
parentIndeterminate = computed(() => {
  const count = selectedFruits().length;
  return count > 0 && count < fruits.length;
});

<coar-checkbox
  label="Select all"
  [checked]="parentChecked()"
  [indeterminate]="parentIndeterminate()"
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
<coar-checkbox label="Disabled checked" [disabled]="true" [checked]="true" />`,

    readonly: `<coar-checkbox label="Readonly unchecked" [readonly]="true" [checked]="false" />
<coar-checkbox label="Readonly checked" [readonly]="true" [checked]="true" />`,

    hint: `<coar-checkbox
  label="Send me product updates"
  hint="We'll only send relevant information, no spam"
/>`,

    sizes: `<coar-checkbox size="xs" label="Extra small checkbox" />
<coar-checkbox size="s" label="Small checkbox" />
<coar-checkbox size="m" label="Medium checkbox (default)" />
<coar-checkbox size="l" label="Large checkbox" />`,

    group: `// Parent state computed from children
parentChecked = computed(() => selectedFruits().length === fruits.length);
parentIndeterminate = computed(() => {
  const count = selectedFruits().length;
  return count > 0 && count < fruits.length;
});

<coar-checkbox
  label="Select all fruits"
  [checked]="parentChecked()"
  [indeterminate]="parentIndeterminate()"
  (checkedChange)="toggleAll($event)"
/>

<coar-checkbox
  label="Apple"
  [checked]="isFruitSelected('apple')"
  (checkedChange)="toggleFruit('apple', $event)"
/>`,
  };

  // Group logic
  fruits = ['apple', 'banana', 'orange'];

  isFruitSelected(fruit: string): boolean {
    return this.selectedFruits().includes(fruit);
  }

  toggleFruit(fruit: string, checked: boolean | undefined): void {
    const current = this.selectedFruits();
    if (checked) {
      this.selectedFruits.set([...current, fruit]);
    } else {
      this.selectedFruits.set(current.filter((f) => f !== fruit));
    }
  }

  toggleAllFruits(checked: boolean | undefined): void {
    if (checked) {
      this.selectedFruits.set([...this.fruits]);
    } else {
      this.selectedFruits.set([]);
    }
  }
}
