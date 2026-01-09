import { Component, signal } from '@angular/core';

import {
  CoarNumberInputComponent,
  CoarCodeBlockComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarDividerComponent,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [
    CoarNumberInputComponent,
    CoarCodeBlockComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarDividerComponent
],
  templateUrl: './number-input.page.html',
  styleUrl: './number-input.page.css',
})
export class NumberInputPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/ui-components/CoarNumberInputComponent/overview.md';
  protected readonly apiPath = '/docs/libs/ui-components/CoarNumberInputComponent/api.md';

  protected readonly germanNumberFormat = { decimal: ',', thousand: '.' } as const;
  protected readonly usNumberFormat = { decimal: '.', thousand: ',' } as const;

  // Demo values
  basicValue = signal<number | null>(42);
  quantityValue = signal<number | null>(1);
  priceValue = signal<number | null>(99.99);
  percentValue = signal<number | null>(50);
  temperatureValue = signal<number | null>(20);
  germanPrice = signal<number | null>(1234.56);
  usPrice = signal<number | null>(1234.56);
  formSimulationValue = signal<number | null>(1234.56);

  onFormSimulationInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const parsed = parseFloat(value);
    this.formSimulationValue.set(isNaN(parsed) ? null : parsed);
  }

  onFormSimulationValueChange(value: number | null): void {
    this.formSimulationValue.set(value);
  }

  codeExamples = {
    basic: `<coar-number-input
  stepperButtons
  label="Quantity"
  placeholder="Enter amount"
  [value]="basicValue()"
  (valueChange)="basicValue.set($event)"
/>`,

    minMax: `<coar-number-input
  stepperButtons
  label="Quantity"
  [min]="1"
  [max]="99"
  [value]="quantityValue()"
  (valueChange)="quantityValue.set($event)"
  hint="Between 1 and 99"
/>`,

    step: `<!-- Step of 1 (default) -->
<coar-number-input stepperButtons label="Whole Numbers" [step]="1" [value]="10" />

<!-- Step of 0.5 -->
<coar-number-input stepperButtons label="Half Steps" [step]="0.5" [decimals]="1" [value]="5.5" />

<!-- Step of 10 -->
<coar-number-input stepperButtons label="Tens" [step]="10" [value]="100" />`,

    decimals: `<coar-number-input
  stepperButtons
  label="Price"
  [decimals]="2"
  [step]="0.01"
  suffix="EUR"
  [value]="priceValue()"
  (valueChange)="priceValue.set($event)"
/>`,

    locale: `<!-- German locale: comma as decimal, period as thousands -->
<coar-number-input
  label="Preis (DE)"
  [decimals]="2"
  [numberFormat]="{ decimal: ',', thousand: '.' }"
  suffix="EUR"
  [value]="germanPrice()"
  (valueChange)="germanPrice.set($event)"
/>

<!-- US locale: period as decimal, comma as thousands -->
<coar-number-input
  label="Price (US)"
  [decimals]="2"
  [numberFormat]="{ decimal: '.', thousand: ',' }"
  prefix="$"
  [value]="usPrice()"
  (valueChange)="usPrice.set($event)"
/>`,

    prefixSuffix: `<coar-number-input label="Price" prefix="$" [decimals]="2" [value]="99.99" />
<coar-number-input label="Percentage" suffix="%" [min]="0" [max]="100" [value]="50" />
<coar-number-input label="Temperature" suffix="°C" [min]="-40" [max]="50" [value]="20" />`,

    stepperButtons: `<!-- No buttons (default) -->
  <coar-number-input label="No Buttons" [value]="basicValue()" (valueChange)="basicValue.set($event)" />

<!-- Both buttons via attribute -->
  <coar-number-input stepperButtons label="Both Buttons" [value]="basicValue()" (valueChange)="basicValue.set($event)" />

<!-- Only increment button (counter) -->
  <coar-number-input stepperButtons="increment" label="Increment Only" [value]="basicValue()" (valueChange)="basicValue.set($event)" />

<!-- Only decrement button (countdown) -->
  <coar-number-input stepperButtons="decrement" label="Decrement Only" [value]="basicValue()" (valueChange)="basicValue.set($event)" />`,

    sizes: `<!-- Extra Small - 27px height -->
<coar-number-input stepperButtons size="xs" label="Extra Small" [value]="10" />

<!-- Small - 32px height -->
<coar-number-input stepperButtons size="sm" label="Small" [value]="20" />

<!-- Medium (default) - 40px height -->
<coar-number-input stepperButtons size="md" label="Medium" [value]="30" />

<!-- Large - 48px height -->
<coar-number-input stepperButtons size="lg" label="Large" [value]="40" />`,

    dragLabel: `<!-- Drag the label left/right to change value! -->
<coar-number-input
  label="Drag me ↔"
  hint="Click and drag the label to adjust"
  [value]="basicValue()"
  (valueChange)="basicValue.set($event)"
/>`,

    disabled: `<coar-number-input stepperButtons label="Disabled" [value]="100" [disabled]="true" />
<coar-number-input stepperButtons label="Readonly" [value]="200" [readonly]="true" />`,
  };
}
