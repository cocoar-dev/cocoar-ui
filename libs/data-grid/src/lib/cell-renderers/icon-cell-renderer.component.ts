import { Component, ChangeDetectionStrategy } from '@angular/core';
import type { ICellRendererParams } from 'ag-grid-community';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import { CoarIconComponent, type CoarIconSize } from '@cocoar/ui/components';
import type { IconCellRendererConfig } from './icon-cell-renderer.models';

@Component({
  selector: 'coar-icon-cell-renderer',
  standalone: true,
  imports: [CoarIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    :host(.clickable) {
      cursor: pointer;
    }
  `,
  template: `
    @if (iconName) {
      <coar-icon
        [name]="iconName"
        [size]="size"
        [source]="source"
        [color]="color"
      />
    }
  `,
  host: {
    '[class.clickable]': '!!onClick',
    '(click)': 'handleClick()',
  },
})
export class CoarIconCellRendererComponent implements ICellRendererAngularComp {
  iconName = '';
  size: CoarIconSize = 's';
  source: string | undefined;
  color = 'inherit';
  onClick: ((params: ICellRendererParams) => void) | undefined;

  private params!: ICellRendererParams;

  agInit(params: ICellRendererParams & { config?: IconCellRendererConfig }): void {
    this.params = params;
    const config = params.config ?? {};
    this.size = config.size ?? 's';
    this.source = config.source;
    this.color = config.color ?? 'inherit';
    this.onClick = config.onClick;
    this.iconName = params.value ?? '';
  }

  refresh(params: ICellRendererParams & { config?: IconCellRendererConfig }): boolean {
    this.params = params;
    this.iconName = params.value ?? '';
    return true;
  }

  handleClick(): void {
    this.onClick?.(this.params);
  }
}
