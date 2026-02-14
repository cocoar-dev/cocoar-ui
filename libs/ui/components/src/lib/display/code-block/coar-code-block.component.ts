import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  afterNextRender,
  computed,
  input,
  signal,
  inject,
  booleanAttribute,
} from '@angular/core';

import { CoarButtonComponent } from '../button/coar-button.component';
import Prism from 'prismjs';

import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markup';

export type CodeBlockColor = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'accent';

@Component({
  selector: 'coar-code-block',
  standalone: true,
  imports: [CoarButtonComponent],
  templateUrl: './coar-code-block.component.html',
  styleUrl: './coar-code-block.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.coar-code-block--elevated]': 'elevated()',
    '[class.coar-code-block--neutral]': 'color() === "neutral"',
    '[class.coar-code-block--success]': 'color() === "success"',
    '[class.coar-code-block--warning]': 'color() === "warning"',
    '[class.coar-code-block--error]': 'color() === "error"',
    '[class.coar-code-block--info]': 'color() === "info"',
    '[class.coar-code-block--accent]': 'color() === "accent"',
  },
})
export class CoarCodeBlockComponent {
  private readonly injector = inject(Injector);
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

  /** Whether to hide the border and border-radius */
  borderless = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Adds a box-shadow for elevation/depth */
  elevated = input(false, { transform: booleanAttribute });

  /** Whether to show line numbers */
  showLineNumbers = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });

  /** Color variant for the header area */
  color = input<CodeBlockColor>('neutral');

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
    // Signal inputs can be bound after construction; apply the initial collapsed state once
    // the component has been rendered.
    afterNextRender(
      () => {
        this.isCollapsed.set(this.collapsed());
      },
      { injector: this.injector }
    );
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
