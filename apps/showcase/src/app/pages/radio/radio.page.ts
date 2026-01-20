import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CoarRadioGroupComponent,
  CoarRadioComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarButtonComponent,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [
    FormsModule,
    CoarRadioGroupComponent,
    CoarRadioComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarButtonComponent,
  ],
  templateUrl: './radio.page.html',
  styleUrl: './radio.page.css',
})
export class RadioPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/ui-components/coar-radio-group.docs.md';
  protected readonly apiPath = '/docs/libs/ui-components/coar-radio-group.api.md';

  /** Demo values */
  basicSelection = signal<string | null>(null);
  colorSelection = signal<string>('blue');
  planSelection = signal<string>('pro');
  disabledSelection = signal<string>('option2');

  /** Color options */
  colors = [
    { value: 'red', label: 'Red', description: 'Passionate and energetic' },
    { value: 'blue', label: 'Blue', description: 'Calm and trustworthy' },
    { value: 'green', label: 'Green', description: 'Natural and balanced' },
    { value: 'purple', label: 'Purple', description: 'Creative and luxurious' },
  ];

  /** Plan options */
  plans = [
    { value: 'free', label: 'Free', price: '$0', features: '5 projects, 1GB storage' },
    { value: 'pro', label: 'Pro', price: '$19/mo', features: 'Unlimited projects, 100GB storage' },
    {
      value: 'enterprise',
      label: 'Enterprise',
      price: '$99/mo',
      features: 'Custom limits, priority support',
    },
  ];

  /** Code examples */
  codeExamples = {
    basic: `<coar-radio-group [(ngModel)]="selectedOption">
  <coar-radio value="option1">Option 1</coar-radio>
  <coar-radio value="option2">Option 2</coar-radio>
  <coar-radio value="option3">Option 3</coar-radio>
</coar-radio-group>`,

    vertical: `<coar-radio-group [(ngModel)]="selectedColor" layout="vertical">
  @for (color of colors; track color.value) {
    <coar-radio [value]="color.value">
      {{ color.label }} - {{ color.description }}
    </coar-radio>
  }
</coar-radio-group>`,

    horizontal: `<coar-radio-group [(ngModel)]="selectedSize" layout="horizontal">
  <coar-radio value="small">Small</coar-radio>
  <coar-radio value="medium">Medium</coar-radio>
  <coar-radio value="large">Large</coar-radio>
</coar-radio-group>`,

    disabled: `<!-- Entire group disabled -->
<coar-radio-group [(ngModel)]="selection" [disabled]="true">
  <coar-radio value="option1">Option 1</coar-radio>
  <coar-radio value="option2">Option 2</coar-radio>
</coar-radio-group>

<!-- Single option disabled -->
<coar-radio-group [(ngModel)]="selection">
  <coar-radio value="available">Available</coar-radio>
  <coar-radio value="unavailable" [disabled]="true">Unavailable</coar-radio>
</coar-radio-group>`,

    withForms: `// In component
import { FormControl, ReactiveFormsModule } from '@angular/forms';

selectedPlan = new FormControl('pro');

// In template
<coar-radio-group [formControl]="selectedPlan">
  @for (plan of plans; track plan.value) {
    <coar-radio [value]="plan.value">
      {{ plan.label }} ({{ plan.price }})
    </coar-radio>
  }
</coar-radio-group>`,
  };

  /** Reset selection */
  resetBasic(): void {
    this.basicSelection.set(null);
  }
}
