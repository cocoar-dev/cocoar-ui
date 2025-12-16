import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarNoteComponent,
  CoarSingleSelectComponent,
  CoarTabComponent,
  CoarTabGroupComponent,
  type CoarSelectOption,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

interface Country {
  id: number;
  code: string;
  name: string;
  region: string;
}

@Component({
  selector: 'app-single-select',
  standalone: true,
  imports: [
    CommonModule,
    CoarSingleSelectComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
  ],
  templateUrl: './single-select.page.html',
  styleUrl: './single-select.page.css',
})
export class SingleSelectPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/components/single-select/overview.md';
  protected readonly apiPath = '/docs/components/single-select/api.md';

  singleValue = signal<string | null>(null);
  singleWithValue = signal<string | null>('at');

  selectedCountryObject = signal<Country | null>({
    id: 2,
    code: 'AT',
    name: 'Austria',
    region: 'Europe',
  });

  countryOptions: CoarSelectOption<string>[] = [
    { value: 'de', label: 'Germany', icon: 'users' },
    { value: 'at', label: 'Austria', icon: 'users' },
    { value: 'ch', label: 'Switzerland', icon: 'users' },
    { value: 'us', label: 'United States', icon: 'users' },
    { value: 'uk', label: 'United Kingdom', icon: 'users' },
    { value: 'fr', label: 'France', icon: 'users' },
    { value: 'it', label: 'Italy', icon: 'users' },
    { value: 'es', label: 'Spain', icon: 'users' },
    { value: 'nl', label: 'Netherlands', icon: 'users' },
    { value: 'be', label: 'Belgium', icon: 'users' },
    { value: 'pl', label: 'Poland', icon: 'users' },
    { value: 'se', label: 'Sweden', icon: 'users' },
  ];

  basicOptions: CoarSelectOption<string>[] = [
    { value: 'option-1', label: 'Option 1' },
    { value: 'option-2', label: 'Option 2' },
    { value: 'option-3', label: 'Option 3' },
    { value: 'option-4', label: 'Option 4 (Disabled)', disabled: true },
    { value: 'option-5', label: 'Option 5' },
  ];

  countryObjectOptions: CoarSelectOption<Country>[] = [
    { value: { id: 1, code: 'DE', name: 'Germany', region: 'Europe' }, label: 'Germany' },
    { value: { id: 2, code: 'AT', name: 'Austria', region: 'Europe' }, label: 'Austria' },
    { value: { id: 3, code: 'CH', name: 'Switzerland', region: 'Europe' }, label: 'Switzerland' },
    {
      value: { id: 4, code: 'US', name: 'United States', region: 'Americas' },
      label: 'United States',
    },
    {
      value: { id: 5, code: 'UK', name: 'United Kingdom', region: 'Europe' },
      label: 'United Kingdom',
    },
    { value: { id: 6, code: 'FR', name: 'France', region: 'Europe' }, label: 'France' },
  ];

  compareCountryById = (a: unknown, b: unknown): boolean => {
    const countryA = a as Country | null;
    const countryB = b as Country | null;
    return countryA?.id === countryB?.id;
  };

  codeExamples = {
    basic: `<coar-single-select
  label="Country"
  [options]="countryOptions"
  [value]="selectedCountry"
  (valueChange)="selectedCountry = $event"
  placeholder="Select a country..."
/>`,

    searchable: `<coar-single-select
  label="Country"
  [options]="countryOptions"
  [searchable]="true"
  searchPlaceholder="Search countries..."
  [value]="selectedCountry"
  (valueChange)="selectedCountry = $event"
/>`,

    compareWith: `// Component
interface Country {
  id: number;
  code: string;
  name: string;
  region: string;
}

countryOptions: CoarSelectOption<Country>[] = [
  { value: { id: 1, code: 'DE', name: 'Germany', region: 'Europe' }, label: 'Germany' },
  { value: { id: 2, code: 'AT', name: 'Austria', region: 'Europe' }, label: 'Austria' },
];

// Form value can be a different object instance.
selectedCountry: Country | null = { id: 2, code: 'AT', name: 'Austria', region: 'Europe' };

compareById = (a: Country | null, b: Country | null) => a?.id === b?.id;

// Template
<coar-single-select
  label="Country"
  [options]="countryOptions"
  [value]="selectedCountry"
  (valueChange)="selectedCountry = $event"
  [compareWith]="compareById"
/>`,

    states: `<coar-single-select label="Disabled" [options]="options" value="option-1" [disabled]="true" />
<coar-single-select label="Readonly" [options]="options" value="option-2" [readonly]="true" />
<coar-single-select label="Required" [options]="options" [required]="true" hint="This field is required" />
<coar-single-select label="Error" [options]="options" error="Please select an option" />`,

    sizes: `<coar-single-select label="Extra Small" [options]="options" size="xs" placeholder="xs" />
<coar-single-select label="Small" [options]="options" size="sm" placeholder="sm" />
<coar-single-select label="Medium" [options]="options" size="md" placeholder="md" />
<coar-single-select label="Large" [options]="options" size="lg" placeholder="lg" />`,

    dropdownPositionTop: `<coar-single-select
  label="Country"
  [options]="countryOptions"
  dropdownPositionPreference="top"
  placeholder="Select a country..."
/>`,
  };
}
