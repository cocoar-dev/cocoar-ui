import { Directive, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';

import { CoarGridBuilder } from '../builders/coar-grid-builder';

/**
 * Directive that binds a CoarGridBuilder to an AG Grid instance.
 *
 * @example
 * ```html
 * <ag-grid-angular
 *   [coarDataGrid]="gridBuilder"
 *   class="ag-theme-cocoar"
 * />
 * ```
 *
 * @example
 * ```ts
 * // In component:
 * readonly gridBuilder = CoarGridBuilder.create<User>()
 *   .columns([
 *     col => col.field('name').header('Name').flex(1),
 *     col => col.field('email').header('Email').flex(1),
 *   ])
 *   .rowData(this.users);
 * ```
 */
@Directive({
  selector: 'ag-grid-angular[coarDataGrid]',
  exportAs: 'coarDataGrid',
  standalone: true,
  host: {
    class: 'ag-theme-cocoar',
    style: 'display: flex; flex-direction: column; flex-grow: 1;',
  },
})
export class CoarDataGridDirective<TData> implements OnInit, OnDestroy {
  readonly #agGrid = inject(AgGridAngular<TData>);

  #gridBuilder?: CoarGridBuilder<TData>;

  /**
   * The grid builder configuration
   */
  @Input()
  set coarDataGrid(value: CoarGridBuilder<TData>) {
    this.#gridBuilder = value;
  }

  ngOnInit(): void {
    if (!this.#gridBuilder) {
      console.warn('CoarDataGridDirective: No grid builder provided');
      return;
    }

    // Bind the builder to the AG Grid instance
    this.#gridBuilder._bind(this.#agGrid);
  }

  ngOnDestroy(): void {
    this.#gridBuilder?._destroy();
  }
}
