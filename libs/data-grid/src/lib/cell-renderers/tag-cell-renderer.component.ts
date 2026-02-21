import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import type { ICellRendererParams } from 'ag-grid-community';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import { CoarTagComponent, type TagVariant } from '@cocoar/ui/components';
import { COAR_I18N_PROVIDER, type CoarI18nProvider } from '@cocoar/localization';
import type { TagCellRendererConfig } from './tag-cell-renderer.models';

interface TagItem {
  label: string;
  variant: TagVariant;
}

@Component({
  selector: 'coar-tag-cell-renderer',
  standalone: true,
  imports: [CoarTagComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--coar-spacing-xs, 4px);
      flex-wrap: wrap;
      height: 100%;
    }
  `,
  template: `
    @for (tag of tags; track tag.label) {
      <coar-tag [variant]="tag.variant" [size]="size">{{ tag.label }}</coar-tag>
    }
  `,
})
export class CoarTagCellRendererComponent implements ICellRendererAngularComp {
  tags: TagItem[] = [];
  size: 's' | 'm' | 'l' = 's';

  private config: TagCellRendererConfig = {};
  private readonly i18n = inject(COAR_I18N_PROVIDER, { optional: true }) as CoarI18nProvider | null;

  agInit(params: ICellRendererParams & { config?: TagCellRendererConfig }): void {
    this.config = params.config ?? {};
    this.size = this.config.size ?? 's';
    this.updateTags(params.value, params.valueFormatted);
  }

  refresh(params: ICellRendererParams & { config?: TagCellRendererConfig }): boolean {
    this.config = params.config ?? this.config;
    this.size = this.config.size ?? this.size;
    this.updateTags(params.value, params.valueFormatted);
    return true;
  }

  private updateTags(value: unknown, valueFormatted: string | null | undefined): void {
    const rawLabels = this.extractLabels(this.resolveValueForLabels(value, valueFormatted));
    this.tags = rawLabels.map((label) => ({
      label: this.translateLabel(label),
      variant: this.resolveVariant(label),
    }));
  }

  private resolveValueForLabels(
    value: unknown,
    valueFormatted: string | null | undefined
  ): unknown {
    if (valueFormatted == null) return value;

    // If the underlying value is already structured for tag rendering (array/object),
    // prefer it over the formatted string to preserve multiple tags.
    if (Array.isArray(value)) return value;
    if (value != null && typeof value === 'object') return value;

    return valueFormatted;
  }

  private extractLabels(value: unknown): string[] {
    if (value == null) return [];
    if (Array.isArray(value)) {
      return value.map((item) => this.labelFromItem(item));
    }
    if (typeof value === 'string') {
      const separator = this.config.separator ?? ',';
      return value
        .split(separator)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [String(value)];
  }

  private labelFromItem(item: unknown): string {
    if (item != null && typeof item === 'object' && this.config.labelProperty) {
      return String((item as Record<string, unknown>)[this.config.labelProperty] ?? '');
    }
    return String(item ?? '');
  }

  private translateLabel(label: string): string {
    if (this.config.i18nPrefix && this.i18n) {
      return this.i18n.t(this.config.i18nPrefix + label);
    }
    return label;
  }

  private resolveVariant(label: string): TagVariant {
    return this.config.variantMap?.[label] ?? this.config.variant ?? 'neutral';
  }
}
