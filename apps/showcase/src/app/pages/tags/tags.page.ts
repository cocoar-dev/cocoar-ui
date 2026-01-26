import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarTagComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
} from '@cocoar/ui-components';
import type { TagColor, TagSize } from '@cocoar/ui-components';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [
    CommonModule,
    CoarTagComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
  ],
  templateUrl: './tags.page.html',
  styleUrl: './tags.page.css',
})
export class TagsPage {

  /** Tag color variants */
  colors: TagColor[] = ['neutral', 'success', 'warning', 'error', 'info', 'accent'];

  /** Tag sizes */
  sizes: TagSize[] = ['sm', 'md', 'lg'];

  /** Demo tags for closable example */
  tags = signal<string[]>(['Angular', 'TypeScript', 'Design System', 'UI Components']);

  /** Remove a tag */
  removeTag(tag: string): void {
    this.tags.update((tags) => tags.filter((t) => t !== tag));
  }

  /** Reset tags */
  resetTags(): void {
    this.tags.set(['Angular', 'TypeScript', 'Design System', 'UI Components']);
  }

  /** Code examples */
  codeExamples = {
    basic: `<coar-tag>Default</coar-tag>
<coar-tag color="success">Published</coar-tag>
<coar-tag color="warning">Draft</coar-tag>
<coar-tag color="error">Rejected</coar-tag>
<coar-tag color="info">Review</coar-tag>
<coar-tag color="accent">Featured</coar-tag>`,

    sizes: `<coar-tag size="sm">Small</coar-tag>
<coar-tag size="md">Medium</coar-tag>
<coar-tag size="lg">Large</coar-tag>`,

    elevated: `<!-- With elevation (box-shadow) -->
<coar-tag elevated>Default</coar-tag>
<coar-tag color="success" elevated>Success</coar-tag>
<coar-tag color="accent" elevated>Accent</coar-tag>`,

    borderless: `<!-- Borderless (no border) -->
<coar-tag borderless>Default</coar-tag>
<coar-tag color="success" borderless>Success</coar-tag>
<coar-tag color="accent" borderless>Accent</coar-tag>`,

    closable: `<coar-tag closable (closed)="onRemove('Angular')">Angular</coar-tag>
<coar-tag closable (closed)="onRemove('TypeScript')">TypeScript</coar-tag>`,

    categories: `<!-- Article categories -->
<coar-tag color="accent">Featured</coar-tag>
<coar-tag color="neutral">Technology</coar-tag>
<coar-tag color="neutral">Design</coar-tag>

<!-- Status labels -->
<coar-tag color="success">Active</coar-tag>
<coar-tag color="warning">Pending</coar-tag>
<coar-tag color="error">Expired</coar-tag>`,

    comparison: `<!-- Badge: notification counts, status dots -->
<coar-badge [content]="5" variant="error" />
<coar-badge [dot]="true" variant="success" />

<!-- Tag: labels, categories, keywords -->
<coar-tag color="success">Published</coar-tag>
<coar-tag closable>Angular</coar-tag>`,
  };
}
