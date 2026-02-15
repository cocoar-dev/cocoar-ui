import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarPaginationComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-pagination-page',
  standalone: true,
  imports: [
    CommonModule,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarPaginationComponent,
  ],
  templateUrl: './pagination.page.html',
  styleUrl: './pagination.page.css',
})
export class PaginationPage {
  importCode = `import { CoarPaginationComponent } from '@cocoar/ui/components';`;

  currentPage = signal(1);
  currentPage2 = signal(5);

  basicExample = `<coar-pagination
  [totalItems]="100"
  [pageSize]="10"
  [(currentPage)]="currentPage"
  (pageChanged)="onPageChanged($event)"
/>`;

  customPageSizeExample = `<coar-pagination
  [totalItems]="200"
  [pageSize]="20"
  [(currentPage)]="currentPage"
/>`;

  disabledExample = `<coar-pagination
  [totalItems]="100"
  [pageSize]="10"
  [(currentPage)]="currentPage"
  disabled
/>`;

  noFirstLastExample = `<coar-pagination
  [totalItems]="100"
  [pageSize]="10"
  [(currentPage)]="currentPage"
  [showFirstLast]="false"
/>`;
}
