import { Component, signal } from '@angular/core';
import {
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarNoteComponent,
  CoarTabComponent,
  CoarTabGroupComponent,
  CoarTagSelectComponent,
  type CoarSelectOption,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-tag-select',
  standalone: true,
  imports: [
    CoarTagSelectComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
  ],
  templateUrl: './tag-select.page.html',
  styleUrl: './tag-select.page.css',
})
export class TagSelectPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/ui-components/coar-tag-select.docs.md';
  protected readonly apiPath = '/docs/libs/ui-components/coar-tag-select.api.md';

  tags = signal<string[]>([]);
  tagsWithValue = signal<string[]>(['Angular', 'TypeScript']);
  createdTags = signal<string[]>(['Angular', 'TypeScript', 'RxJS', 'CSS']);

  tagOptions: CoarSelectOption<string>[] = [
    { value: 'Angular', label: 'Angular' },
    { value: 'TypeScript', label: 'TypeScript' },
    { value: 'RxJS', label: 'RxJS' },
    { value: 'CSS', label: 'CSS' },
    { value: 'HTML', label: 'HTML' },
    { value: 'JavaScript', label: 'JavaScript' },
  ];

  onTagCreated(tag: string): void {
    this.createdTags.update((tags) => [...tags, tag]);
  }

  codeExamples = {
    basic: `<coar-tag-select
  label="Tags"
  [options]="tagOptions"
  [value]="selectedTags"
  (valueChange)="selectedTags = $event"
  placeholder="Add tags..."
/>`,

    allowCreate: `<coar-tag-select
  label="Tags"
  [options]="tagOptions"
  [allowCreate]="true"
  [value]="selectedTags"
  (valueChange)="selectedTags = $event"
  (tagCreated)="onTagCreated($event)"
  placeholder="Type to add..."
/>`,

    maxTags: `<coar-tag-select
  label="Tags"
  [options]="tagOptions"
  [maxTags]="3"
  [allowCreate]="true"
  [value]="selectedTags"
  (valueChange)="selectedTags = $event"
  placeholder="Max 3 tags"
/>`,

    sizes: `<coar-tag-select label="Extra Small" [options]="tagOptions" size="xs" placeholder="xs" />
<coar-tag-select label="Small" [options]="tagOptions" size="sm" placeholder="sm" />
<coar-tag-select label="Medium" [options]="tagOptions" size="md" placeholder="md" />
<coar-tag-select label="Large" [options]="tagOptions" size="lg" placeholder="lg" />`,

    dropdownPositionTop: `<coar-tag-select
  label="Tags"
  [options]="tagOptions"
  dropdownPositionPreference="top"
  placeholder="Add tags..."
/>`,
  };
}
