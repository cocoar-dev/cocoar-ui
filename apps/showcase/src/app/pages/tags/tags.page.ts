import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarTagComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
} from '@cocoar/ui/components';
import type { TagVariant, TagSize } from '@cocoar/ui/components';

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
  importCode = `import { CoarTagComponent } from '@cocoar/ui/components';`;

  /** Tag semantic variants */
  variants: TagVariant[] = ['neutral', 'success', 'warning', 'error', 'info', 'accent'];

  /** Tag sizes */
  sizes: TagSize[] = ['s', 'm', 'l'];

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
<coar-tag variant="success">Published</coar-tag>
<coar-tag variant="warning">Draft</coar-tag>
<coar-tag variant="error">Rejected</coar-tag>
<coar-tag variant="info">Review</coar-tag>
<coar-tag variant="accent">Featured</coar-tag>`,

    sizes: `<coar-tag size="s">Small</coar-tag>
<coar-tag size="m">Medium</coar-tag>
<coar-tag size="l">Large</coar-tag>`,

    elevated: `<!-- With elevation (box-shadow) -->
<coar-tag elevated>Default</coar-tag>
<coar-tag variant="success" elevated>Success</coar-tag>
<coar-tag variant="accent" elevated>Accent</coar-tag>`,

    borderless: `<!-- Borderless (no border) -->
<coar-tag borderless>Default</coar-tag>
<coar-tag variant="success" borderless>Success</coar-tag>
<coar-tag variant="accent" borderless>Accent</coar-tag>`,

    closable: `<coar-tag closable (closed)="onRemove('Angular')">Angular</coar-tag>
<coar-tag closable (closed)="onRemove('TypeScript')">TypeScript</coar-tag>`,

    categories: `<!-- Article categories -->
<coar-tag variant="accent">Featured</coar-tag>
<coar-tag variant="neutral">Technology</coar-tag>
<coar-tag variant="neutral">Design</coar-tag>

<!-- Status labels -->
<coar-tag variant="success">Active</coar-tag>
<coar-tag variant="warning">Pending</coar-tag>
<coar-tag variant="error">Expired</coar-tag>`,

    comparison: `<!-- Badge: notification counts, status dots -->
<coar-badge [content]="5" variant="error" />
<coar-badge [dot]="true" variant="success" />

<!-- Tag: labels, categories, keywords -->
<coar-tag variant="success">Published</coar-tag>
<coar-tag closable>Angular</coar-tag>`,
  };
}
