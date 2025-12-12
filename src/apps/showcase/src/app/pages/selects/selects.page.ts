import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CoarSingleSelectComponent,
  CoarMultiSelectComponent,
  CoarTagSelectComponent,
  CoarSelectOption,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarNoteComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarTableComponent,
} from '@cocoar/ui-components';

/** Example interface for object-based options */
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
    CommonModule,
    FormsModule,
    CoarSingleSelectComponent,
    CoarMultiSelectComponent,
    CoarTagSelectComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarTableComponent,
  ],
  templateUrl: './selects.page.html',
  styleUrl: './selects.page.css',
})
export class SelectsPage {
  activeTab = 'examples';

  // Demo values
  singleValue = signal<string | null>(null);
  singleWithValue = signal<string | null>('option-2');

  // Object value demo (simulates value from API)
  selectedCountryObject = signal<Country | null>({
    id: 2,
    code: 'AT',
    name: 'Austria',
    region: 'Europe',
  });
  multiValue = signal<string[]>([]);
  multiWithValue = signal<string[]>(['skill-1', 'skill-3']);
  tagValue = signal<string[]>([]);
  tagWithValue = signal<string[]>(['Angular', 'TypeScript']);
  createdTags = signal<string[]>(['Angular', 'TypeScript', 'RxJS', 'CSS']);

  // Sample options
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

  /**
   * Options with full object values.
   * In real apps, these typically come from a different API call than the form value.
   */
  countryObjectOptions: CoarSelectOption<Country>[] = [
    { value: { id: 1, code: 'DE', name: 'Germany', region: 'Europe' }, label: 'Germany' },
    { value: { id: 2, code: 'AT', name: 'Austria', region: 'Europe' }, label: 'Austria' },
    { value: { id: 3, code: 'CH', name: 'Switzerland', region: 'Europe' }, label: 'Switzerland' },
    { value: { id: 4, code: 'US', name: 'United States', region: 'Americas' }, label: 'United States' },
    { value: { id: 5, code: 'UK', name: 'United Kingdom', region: 'Europe' }, label: 'United Kingdom' },
    { value: { id: 6, code: 'FR', name: 'France', region: 'Europe' }, label: 'France' },
  ];

  /**
   * Compare function for matching Country objects by their ID.
   * This allows the select to match values even when they're different object instances.
   */
  compareCountryById = (a: unknown, b: unknown): boolean => {
    const countryA = a as Country | null;
    const countryB = b as Country | null;
    return countryA?.id === countryB?.id;
  };

  tagOptions: CoarSelectOption<string>[] = [
    { value: 'Angular', label: 'Angular' },
    { value: 'TypeScript', label: 'TypeScript' },
    { value: 'RxJS', label: 'RxJS' },
    { value: 'CSS', label: 'CSS' },
    { value: 'HTML', label: 'HTML' },
    { value: 'JavaScript', label: 'JavaScript' },
  ];

  onTagCreated(tag: string): void {
    // In a real application, this would save the new tag to a service
    this.createdTags.update((tags) => [...tags, tag]);
  }

  // API properties tables
  singleSelectProperties = [
    { name: 'label', type: 'string', default: "''", description: 'Label text displayed above the select' },
    { name: 'placeholder', type: 'string', default: "'Select an option...'", description: 'Placeholder text when no option is selected' },
    { name: 'options', type: 'CoarSelectOption[]', default: '[]', description: 'Available options to choose from' },
    { name: 'value', type: 'T | null', default: 'null', description: 'Current selected value (two-way bindable)' },
    { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Select size matching other form components' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the select' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes the select read-only' },
    { name: 'required', type: 'boolean', default: 'false', description: 'Marks as required, shows asterisk' },
    { name: 'clearable', type: 'boolean', default: 'true', description: 'Show clear button when value is selected' },
    { name: 'searchable', type: 'boolean', default: 'false', description: 'Enable search/filter in dropdown' },
    { name: 'error', type: 'string', default: "''", description: 'Error message to display' },
    { name: 'hint', type: 'string', default: "''", description: 'Hint text below the select' },
  ];

  multiSelectProperties = [
    { name: 'label', type: 'string', default: "''", description: 'Label text displayed above the select' },
    { name: 'placeholder', type: 'string', default: "'Select options...'", description: 'Placeholder text when no options selected' },
    { name: 'options', type: 'CoarSelectOption[]', default: '[]', description: 'Available options to choose from' },
    { name: 'value', type: 'T[]', default: '[]', description: 'Current selected values (two-way bindable)' },
    { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Select size matching other form components' },
    { name: 'maxDisplayItems', type: 'number', default: '3', description: 'Max items to display before showing count' },
    { name: 'showSelectAll', type: 'boolean', default: 'false', description: 'Show "Select All" option' },
    { name: 'clearable', type: 'boolean', default: 'true', description: 'Show clear button when values selected' },
    { name: 'searchable', type: 'boolean', default: 'false', description: 'Enable search/filter in dropdown' },
  ];

  tagSelectProperties = [
    { name: 'label', type: 'string', default: "''", description: 'Label text displayed above the select' },
    { name: 'placeholder', type: 'string', default: "'Add tags...'", description: 'Placeholder text when no tags selected' },
    { name: 'options', type: 'CoarSelectOption[]', default: '[]', description: 'Available tag options' },
    { name: 'value', type: 'T[]', default: '[]', description: 'Current selected tag values (two-way bindable)' },
    { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Select size matching other form components' },
    { name: 'allowCreate', type: 'boolean', default: 'false', description: 'Allow creating new tags' },
    { name: 'maxTags', type: 'number', default: '0', description: 'Maximum tags allowed (0 = unlimited)' },
    { name: 'createPrefix', type: 'string', default: "'Create: '", description: 'Text prefix for create option' },
  ];

  // Code examples
  codeExamples = {
    singleBasic: `<coar-single-select
  label="Country"
  [options]="countryOptions"
  [(value)]="selectedCountry"
  placeholder="Select a country..."
/>`,
    singleSearchable: `<coar-single-select
  label="Country"
  [options]="countryOptions"
  [(value)]="selectedCountry"
  [searchable]="true"
  searchPlaceholder="Search countries..."
/>`,
    multiBasic: `<coar-multi-select
  label="Skills"
  [options]="skillOptions"
  [(value)]="selectedSkills"
  placeholder="Select skills..."
/>`,
    multiSelectAll: `<coar-multi-select
  label="Skills"
  [options]="skillOptions"
  [(value)]="selectedSkills"
  [showSelectAll]="true"
  [searchable]="true"
/>`,
    tagBasic: `<coar-tag-select
  label="Tags"
  [options]="tagOptions"
  [(value)]="selectedTags"
  placeholder="Add tags..."
/>`,
    tagCreate: `<coar-tag-select
  label="Tags"
  [options]="tagOptions"
  [(value)]="selectedTags"
  [allowCreate]="true"
  (tagCreated)="onTagCreated($event)"
/>`,
    dropdownPositionTop: `<coar-single-select
  label="Country"
  [options]="countryOptions"
  dropdownPositionPreference="top"
  placeholder="Select a country..."
/>`,
    compareWith: `// Component
interface Country {
  id: number;
  code: string;
  name: string;
  region: string;
}

// Options from one API call
countryOptions: CoarSelectOption<Country>[] = [
  { value: { id: 1, code: 'DE', name: 'Germany', region: 'Europe' }, label: 'Germany' },
  { value: { id: 2, code: 'AT', name: 'Austria', region: 'Europe' }, label: 'Austria' },
  // ...
];

// Form value from another API (different object instance!)
selectedCountry = signal<Country | null>({ id: 2, code: 'AT', name: 'Austria', region: 'Europe' });

// Compare by ID - objects don't need to be the same reference
compareById = (a: Country | null, b: Country | null) => a?.id === b?.id;

// Template
<coar-single-select
  label="Country"
  [options]="countryOptions"
  [(value)]="selectedCountry"
  [compareWith]="compareById"
/>`,
  };
}
