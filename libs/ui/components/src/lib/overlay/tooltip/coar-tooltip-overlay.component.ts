import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Injector,
  TemplateRef,
  Type,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type CoarTooltipOverlayContent = string | TemplateRef<unknown> | Type<unknown>;

@Component({
  selector: 'coar-tooltip-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coar-tooltip-overlay.component.html',
  styleUrl: './coar-tooltip-overlay.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarTooltipOverlayComponent {
  readonly tooltipId = input<string>('');

  readonly content = input<CoarTooltipOverlayContent | null>(null);

  /** Context passed to template content via ngTemplateOutletContext. */
  readonly context = input<object | null>(null);

  /** Injector for dynamic component content via NgComponentOutlet. */
  readonly contentInjector = input<Injector | null>(null);

  @HostBinding('attr.id')
  protected get hostId(): string | null {
    return this.tooltipId() ? this.tooltipId() : null;
  }

  @HostBinding('attr.role')
  protected readonly role = 'tooltip';

  protected readonly kind = computed<'text' | 'template' | 'component' | 'none'>(() => {
    const value = this.content();
    if (value == null) return 'none';
    if (typeof value === 'string') return 'text';
    if (value instanceof TemplateRef) return 'template';
    return 'component';
  });

  protected readonly text = computed(() => {
    const value = this.content();
    return typeof value === 'string' ? value : '';
  });

  protected readonly templateRef = computed(() => {
    const value = this.content();
    return value instanceof TemplateRef ? value : null;
  });

  protected readonly componentType = computed<Type<unknown> | null>(() => {
    const value = this.content();
    if (value == null) return null;
    if (typeof value === 'string') return null;
    if (value instanceof TemplateRef) return null;
    return value as Type<unknown>;
  });
}
