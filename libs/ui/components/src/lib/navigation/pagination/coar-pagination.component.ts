import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { CoarIconComponent } from '../../display/icon/coar-icon.component';

export type PaginationPageItem = { type: 'page'; page: number } | { type: 'ellipsis' };

@Component({
  selector: 'coar-pagination',
  standalone: true,
  imports: [CoarIconComponent],
  templateUrl: './coar-pagination.component.html',
  styleUrl: './coar-pagination.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'coar-pagination',
    '[class.coar-pagination--disabled]': 'disabled()',
  },
})
export class CoarPaginationComponent {
  readonly totalItems = input.required<number>();
  readonly pageSize = input<number>(10);
  readonly currentPage = model<number>(1);
  readonly maxVisiblePages = input<number>(5);
  readonly showFirstLast = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly pageChanged = output<number>();

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  readonly canGoPrev = computed(() => this.currentPage() > 1);
  readonly canGoNext = computed(() => this.currentPage() < this.totalPages());

  readonly visiblePages = computed<PaginationPageItem[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = this.maxVisiblePages();

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => ({ type: 'page' as const, page: i + 1 }));
    }

    const items: PaginationPageItem[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    let startPage = Math.max(2, current - halfVisible);
    let endPage = Math.min(total - 1, current + halfVisible);

    if (current <= halfVisible + 1) {
      endPage = Math.min(total - 1, maxVisible - 1);
    }
    if (current >= total - halfVisible) {
      startPage = Math.max(2, total - maxVisible + 2);
    }

    items.push({ type: 'page', page: 1 });

    if (startPage > 2) {
      items.push({ type: 'ellipsis' });
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push({ type: 'page', page: i });
    }

    if (endPage < total - 1) {
      items.push({ type: 'ellipsis' });
    }

    if (total > 1) {
      items.push({ type: 'page', page: total });
    }

    return items;
  });

  goToPage(page: number): void {
    if (this.disabled() || page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }
    this.currentPage.set(page);
    this.pageChanged.emit(page);
  }

  trackByItem(_index: number, item: PaginationPageItem): string {
    return item.type === 'page' ? `page-${item.page}` : `ellipsis-${_index}`;
  }
}
