import { Component } from '@angular/core';
import {
  CoarCardComponent,
  CoarCodeBlockComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [
    CoarCardComponent,
    CoarCodeBlockComponent,
  ],
  templateUrl: './links.page.html',
  styleUrl: './links.page.css',
})
export class LinksPage {
  importCode = `/* Import in your global styles or component CSS */
@import '@cocoar/ui/components/display/link/coar-link.css';`;

  codeExamples = {
    basic: `<a class="coar-link" href="#">Default link</a>`,

    subtle: `<a class="coar-link coar-link--subtle" href="#">Subtle link</a>`,

    sizes: `<a class="coar-link coar-link--s" href="#">Small link</a>
<a class="coar-link" href="#">Medium link (default)</a>
<a class="coar-link coar-link--l" href="#">Large link</a>`,

    disabled: `<a class="coar-link" href="#" aria-disabled="true" tabindex="-1">Disabled link</a>`,
  };
}
