
import { Component, signal } from '@angular/core';
import {
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarMultiSelectComponent,
  CoarTabComponent,
  CoarTabGroupComponent,
  type CoarSelectOption,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [
    CoarMultiSelectComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarTabGroupComponent,
    CoarTabComponent
],
  templateUrl: './multi-select.page.html',
  styleUrl: './multi-select.page.css',
})
export class MultiSelectPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/components/multi-select/overview.md';
  protected readonly apiPath = '/docs/components/multi-select/api.md';

  selectedSkills = signal<string[]>([]);
  selectedWithValue = signal<string[]>(['skill-1', 'skill-3']);

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

  codeExamples = {
    basic: `<coar-multi-select
  label="Skills"
  [options]="skillOptions"
  [value]="selectedSkills"
  (valueChange)="selectedSkills = $event"
  placeholder="Select skills..."
/>`,

    selectAllSearchable: `<coar-multi-select
  label="Skills"
  [options]="skillOptions"
  [value]="selectedSkills"
  (valueChange)="selectedSkills = $event"
  [showSelectAll]="true"
  [searchable]="true"
  searchPlaceholder="Filter skills..."
/>`,

    maxDisplayItems: `<coar-multi-select
  label="Skills"
  [options]="skillOptions"
  [value]="selectedSkills"
  (valueChange)="selectedSkills = $event"
  [maxDisplayItems]="2"
  placeholder="Select skills..."
/>`,

    sizes: `<coar-multi-select label="Extra Small" [options]="skillOptions" size="xs" placeholder="xs" />
<coar-multi-select label="Small" [options]="skillOptions" size="sm" placeholder="sm" />
<coar-multi-select label="Medium" [options]="skillOptions" size="md" placeholder="md" />
<coar-multi-select label="Large" [options]="skillOptions" size="lg" placeholder="lg" />`,

    dropdownPositionTop: `<coar-multi-select
  label="Skills"
  [options]="skillOptions"
  dropdownPositionPreference="top"
  placeholder="Select skills..."
/>`,
  };
}
