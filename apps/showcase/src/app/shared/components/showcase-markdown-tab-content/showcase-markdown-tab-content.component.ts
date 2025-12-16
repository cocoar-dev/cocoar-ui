import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CoarIconComponent, CoarNoteComponent } from '@cocoar/ui-components';
import { CoarMarkdownComponent } from '@cocoar/markdown-viewer';
import { switchMap } from 'rxjs';

import { ShowcaseMarkdownDocsService } from '../../services/showcase-markdown-docs.service';

@Component({
  selector: 'showcase-markdown-tab-content',
  standalone: true,
  imports: [CommonModule, CoarMarkdownComponent, CoarIconComponent, CoarNoteComponent],
  templateUrl: './showcase-markdown-tab-content.component.html',
  styleUrl: './showcase-markdown-tab-content.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcaseMarkdownTabContentComponent {
  private readonly markdownDocs = inject(ShowcaseMarkdownDocsService);

  path = input.required<string>();

  protected readonly state$ = toObservable(this.path).pipe(
    switchMap((path) => this.markdownDocs.load(path))
  );
}
