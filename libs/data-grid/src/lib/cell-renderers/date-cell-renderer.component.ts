import { Component, ChangeDetectionStrategy } from '@angular/core';
import type { ICellRendererParams } from 'ag-grid-community';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import { CoarDatePipe } from '@cocoar/localization';
import type { DateCellRendererConfig } from './date-cell-renderer.models';

@Component({
  selector: 'coar-date-cell-renderer',
  standalone: true,
  imports: [CoarDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      align-items: center;
      height: 100%;
    }
  `,
  template: `{{ dateValue | coarDate }}`,
})
export class CoarDateCellRendererComponent implements ICellRendererAngularComp {
  dateValue: Date | string | null = null;

  agInit(params: ICellRendererParams & { config?: DateCellRendererConfig }): void {
    this.updateValue(params.value);
  }

  refresh(params: ICellRendererParams & { config?: DateCellRendererConfig }): boolean {
    this.updateValue(params.value);
    return true;
  }

  private updateValue(value: unknown): void {
    if (!value) {
      this.dateValue = null;
      return;
    }
    if (value instanceof Date) {
      this.dateValue = value;
    } else if (typeof value === 'string') {
      this.dateValue = value;
    } else {
      this.dateValue = null;
    }
  }
}
