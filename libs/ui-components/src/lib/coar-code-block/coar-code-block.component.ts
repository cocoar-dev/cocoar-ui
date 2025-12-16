import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoarButtonComponent } from '../coar-button/coar-button.component';
import Prism from 'prismjs';

import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markup';

@Component({
  selector: 'coar-code-block',
  standalone: true,
  imports: [CommonModule, CoarButtonComponent],
  templateUrl: './coar-code-block.component.html',
  styleUrl: './coar-code-block.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarCodeBlockComponent {
  /** The code to display */
  code = input.required<string>();

  /** Language for syntax highlighting */
  language = input<string>('html');

  /** Title/label for the code block */
  title = input<string>('');

  /** Whether the code block can be collapsed */
  collapsible = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** Whether the code block starts collapsed */
  collapsed = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether to show the copy button */
  showCopy = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** Whether to show line numbers */
  showLineNumbers = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });

  /** Maximum height before scrolling (0 = no limit) */
  maxHeight = input<number>(0);

  /** Internal collapsed state */
  protected isCollapsed = signal(false);

  /** Copy feedback state */
  protected copyFeedback = signal<'idle' | 'copied' | 'error'>('idle');

  /** Highlighted code HTML */
  protected highlightedCode = computed(() => {
    const code = this.code();
    const lang = this.mapLanguage(this.language());

    const grammar = Prism.languages[lang];
    if (grammar) {
      return Prism.highlight(code, grammar, lang);
    }
    return this.escapeHtml(code);
  });

  /** Highlighted code split by line for optional line-number rendering */
  protected highlightedLines = computed(() => this.highlightedCode().split('\n'));

  constructor() {
    setTimeout(() => {
      this.isCollapsed.set(this.collapsed());
    });
  }

  /** Map common language aliases to Prism language names */
  private mapLanguage(lang: string): string {
    const langMap: Record<string, string> = {
      html: 'markup',
      xml: 'markup',
      svg: 'markup',
      ts: 'typescript',
      js: 'javascript',
      sh: 'bash',
      shell: 'bash',
    };
    return langMap[lang.toLowerCase()] || lang.toLowerCase();
  }

  /** Escape HTML for plain text fallback */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /** Toggle collapsed state */
  toggleCollapsed(): void {
    if (this.collapsible()) {
      this.isCollapsed.set(!this.isCollapsed());
    }
  }

  /** Copy code to clipboard */
  async copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copyFeedback.set('copied');
      setTimeout(() => this.copyFeedback.set('idle'), 2000);
    } catch {
      this.copyFeedback.set('error');
      setTimeout(() => this.copyFeedback.set('idle'), 2000);
    }
  }

  /** Get lines for line numbers */
  get lines(): number[] {
    return this.code()
      .split('\n')
      .map((_, i) => i + 1);
  }
}
