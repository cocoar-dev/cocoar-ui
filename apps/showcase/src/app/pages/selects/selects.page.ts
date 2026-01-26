import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarNoteComponent,
  CoarSingleSelectComponent,
  CoarMultiSelectComponent,
  CoarTagSelectComponent,
  type CoarSelectOption,
} from '@cocoar/ui-components';

interface Country {
  id: number;
  code: string;
  name: string;
  region: string;
}

@Component({
  selector: 'app-selects',
  standalone: true,
  imports: [
    JsonPipe,
    CoarCardComponent,
    CoarSingleSelectComponent,
    CoarMultiSelectComponent,
    CoarTagSelectComponent,
    CoarCodeBlockComponent,
    CoarNoteComponent,
  ],
  templateUrl: './selects.page.html',
  styleUrl: './selects.page.css',
})
export class SelectsPage {
  // ============================================
  // SINGLE SELECT STATE
  // ============================================
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

  // ============================================
  // MULTI SELECT STATE
  // ============================================
  selectedSkills = signal<string[]>([]);
  selectedWithMultiValue = signal<string[]>(['skill-1', 'skill-3']);

  skillOptions: CoarSelectOption<string>[] = [
    { value: 'skill-1', label: 'JavaScript' },
    { value: 'skill-2', label: 'TypeScript' },
    { value: 'skill-3', label: 'Angular' },
    { value: 'skill-4', label: 'React' },
    { value: 'skill-5', label: 'Vue' },
    { value: 'skill-6', label: 'Node.js' },
    { value: 'skill-7', label: 'Python' },
    { value: 'skill-8', label: 'Java' },
  ];

  // ============================================
  // TAG SELECT STATE
  // ============================================
  tags = signal<string[]>([]);
  tagsWithValue = signal<string[]>(['Angular', 'TypeScript']);

  tagOptions: CoarSelectOption<string>[] = [
    { value: 'Angular', label: 'Angular' },
    { value: 'TypeScript', label: 'TypeScript' },
    { value: 'RxJS', label: 'RxJS' },
    { value: 'CSS', label: 'CSS' },
    { value: 'HTML', label: 'HTML' },
    { value: 'JavaScript', label: 'JavaScript' },
  ];

  onTagCreated(_tag: string): void {
    // In a real app, you might add the new tag to the options
  }

  // ============================================
  // CODE EXAMPLES
  // ============================================
  codeExamples = {
    // Single Select
    singleBasic: `<coar-single-select
  label="Country"
  [options]="countryOptions"
  [value]="selectedCountry"
  (valueChange)="selectedCountry = $event"
  placeholder="Select a country..."
/>`,

    singleSearchable: `<coar-single-select
  label="Country"
  [options]="countryOptions"
  [searchable]="true"
  searchPlaceholder="Search countries..."
  [value]="selectedCountry"
  (valueChange)="selectedCountry = $event"
/>`,

    singleCompareWith: `// Component
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

    singleStates: `<coar-single-select label="Disabled" [options]="options" value="option-1" [disabled]="true" />
<coar-single-select label="Readonly" [options]="options" value="option-2" [readonly]="true" />
<coar-single-select label="Required" [options]="options" [required]="true" hint="This field is required" />
<coar-single-select label="Error" [options]="options" error="Please select an option" />`,

    // Multi Select
    multiBasic: `<coar-multi-select
  label="Skills"
  [options]="skillOptions"
  [value]="selectedSkills"
  (valueChange)="selectedSkills = $event"
  placeholder="Select skills..."
/>`,

    multiSelectAllSearchable: `<coar-multi-select
  label="Skills"
  [options]="skillOptions"
  [value]="selectedSkills"
  (valueChange)="selectedSkills = $event"
  [showSelectAll]="true"
  [searchable]="true"
  searchPlaceholder="Filter skills..."
/>`,

    multiMaxDisplayItems: `<coar-multi-select
  label="Skills"
  [options]="skillOptions"
  [value]="selectedSkills"
  (valueChange)="selectedSkills = $event"
  [maxDisplayItems]="2"
  placeholder="Select skills..."
/>`,

    // Tag Select
    tagBasic: `<coar-tag-select
  label="Tags"
  [options]="tagOptions"
  [value]="selectedTags"
  (valueChange)="selectedTags = $event"
  placeholder="Add tags..."
/>`,

    tagAllowCreate: `<coar-tag-select
  label="Tags"
  [options]="tagOptions"
  [allowCreate]="true"
  [value]="selectedTags"
  (valueChange)="selectedTags = $event"
  (tagCreated)="onTagCreated($event)"
  placeholder="Type to add..."
/>`,

    tagMaxTags: `<coar-tag-select
  label="Tags"
  [options]="tagOptions"
  [maxTags]="3"
  [allowCreate]="true"
  [value]="selectedTags"
  (valueChange)="selectedTags = $event"
  placeholder="Max 3 tags"
/>`,

    // Shared
    sizes: `<!-- Available sizes: xs, sm, md, lg -->
<coar-single-select label="Extra Small" [options]="options" size="xs" />
<coar-single-select label="Small" [options]="options" size="sm" />
<coar-single-select label="Medium" [options]="options" size="md" />
<coar-single-select label="Large" [options]="options" size="lg" />`,
  };
}
