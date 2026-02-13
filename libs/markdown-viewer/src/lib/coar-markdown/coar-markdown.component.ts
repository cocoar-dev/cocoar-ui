import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { MarkdownDocument, MarkdownNode } from '@cocoar/markdown-core';
import { CoarCodeBlockComponent, CoarTableComponent } from '@cocoar/ui/components';

@Component({
  selector: 'coar-markdown',
  standalone: true,
  imports: [CommonModule, CoarCodeBlockComponent, CoarTableComponent],
  templateUrl: './coar-markdown.component.html',
  styleUrl: './coar-markdown.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarMarkdownComponent {
  doc = input.required<MarkdownDocument>();

  protected codeBlockLanguage(node: MarkdownNode): string {
    const language = node.attrs?.['language'];
    return typeof language === 'string' && language.trim().length > 0 ? language.trim() : 'text';
  }

  protected headingAnchor(node: MarkdownNode): string | null {
    const anchor = node.attrs?.['anchor'];
    return typeof anchor === 'string' && anchor.length > 0 ? anchor : null;
  }

  protected headingDepth(node: MarkdownNode): 1 | 2 | 3 | 4 | 5 | 6 {
    const depth = node.attrs?.['depth'];
    if (typeof depth !== 'number') return 1;
    const value = Math.trunc(depth);
    if (value <= 1) return 1;
    if (value === 2) return 2;
    if (value === 3) return 3;
    if (value === 4) return 4;
    if (value === 5) return 5;
    return 6;
  }

  protected isOrderedList(node: MarkdownNode): boolean {
    return Boolean(node.attrs?.['ordered']);
  }

  protected listStart(node: MarkdownNode): number | null {
    const start = node.attrs?.['start'];
    return typeof start === 'number' ? start : null;
  }

  protected isTaskListItem(node: MarkdownNode): boolean {
    return typeof node.attrs?.['checked'] === 'boolean';
  }

  protected taskChecked(node: MarkdownNode): boolean {
    return node.attrs?.['checked'] === true;
  }

  protected linkUrl(node: MarkdownNode): string | null {
    const url = node.attrs?.['url'];
    return typeof url === 'string' && url.length > 0 ? url : null;
  }

  protected linkHref(node: MarkdownNode): string | null {
    const url = this.linkUrl(node);
    if (!url) return null;

    // With <base href="/">, fragment-only hrefs resolve to the app root (e.g. /#overview),
    // which can navigate away from the current route. Keep anchors on the current page.
    if (url.startsWith('#') && typeof window !== 'undefined') {
      return `${window.location.pathname}${window.location.search}${url}`;
    }

    return url;
  }

  protected linkTarget(node: MarkdownNode): string | null {
    const url = this.linkUrl(node);
    if (!url) return null;
    return this.isExternalLink(url) ? '_blank' : null;
  }

  protected linkRel(node: MarkdownNode): string | null {
    const url = this.linkUrl(node);
    if (!url) return null;
    return this.isExternalLink(url) ? 'noopener noreferrer' : null;
  }

  protected imageSrc(node: MarkdownNode): string | null {
    const url = node.attrs?.['url'];
    return typeof url === 'string' && url.trim().length > 0 ? url.trim() : null;
  }

  protected imageAlt(node: MarkdownNode): string {
    const alt = node.attrs?.['alt'];
    return typeof alt === 'string' ? alt : '';
  }

  protected imageTitle(node: MarkdownNode): string | null {
    const title = node.attrs?.['title'];
    return typeof title === 'string' && title.trim().length > 0 ? title.trim() : null;
  }

  protected isTableColumnRightAligned(tableNode: MarkdownNode, columnIndex: number): boolean {
    return this.getTableColumnAlign(tableNode, columnIndex) === 'right';
  }

  protected isTableColumnCenterAligned(tableNode: MarkdownNode, columnIndex: number): boolean {
    return this.getTableColumnAlign(tableNode, columnIndex) === 'center';
  }

  private getTableColumnAlign(
    tableNode: MarkdownNode,
    columnIndex: number
  ): 'left' | 'right' | 'center' | null {
    const align = tableNode.attrs?.['align'];
    if (!Array.isArray(align)) return null;

    const value = align[columnIndex];
    if (value === 'left' || value === 'right' || value === 'center') return value;
    return null;
  }

  private isExternalLink(url: string): boolean {
    const trimmed = url.trim();
    if (trimmed.startsWith('#')) return false;
    if (trimmed.startsWith('/')) return false;
    if (trimmed.startsWith('./') || trimmed.startsWith('../')) return false;
    if (trimmed.startsWith('mailto:')) return false;
    if (trimmed.startsWith('tel:')) return false;

    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
  }

  protected unsupportedType(node: MarkdownNode): string {
    const originalType = node.attrs?.['originalType'];
    return typeof originalType === 'string' ? originalType : String(node.type);
  }
}
