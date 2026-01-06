import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  input,
  model,
  output,
  computed,
  inject,
  viewChild,
  TemplateRef,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import { CoarScrollbarDirective } from '../coar-scrollbar/coar-scrollbar.directive';
import { coarProvideValueAccessor } from '../forms/coar-control-value-accessor';
import { CoarSelectBase, CoarSelectSize } from './coar-select-base';
import { CoarSelectOption } from './coar-select-option.interface';
import { createOverlayBuilder, type OverlayRef, type Placement } from '@cocoar/ui-overlay';

export type { CoarSelectSize };

/**
 * Single-select dropdown component.
 *
 * Allows selecting one option from a list with keyboard navigation,
 * search/filter support, and full forms integration.
 *
 * @example
 * ```html
 * <coar-single-select
 *   label="Country"
 *   [options]="countries"
 *   [(value)]="selectedCountry"
 *   placeholder="Select a country"
 * />
 * ```
 */
@Component({
  selector: 'coar-single-select',
  standalone: true,
  imports: [FormsModule, CoarIconComponent, CoarScrollbarDirective],
  templateUrl: './coar-single-select.component.html',
  styleUrl: './coar-single-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarSingleSelectComponent)],
  host: {
    '[class.coar-single-select--xs]': 'size() === "xs"',
    '[class.coar-single-select--sm]': 'size() === "sm"',
    '[class.coar-single-select--md]': 'size() === "md"',
    '[class.coar-single-select--lg]': 'size() === "lg"',
    '[class.coar-single-select--disabled]': 'isDisabled()',
    '[class.coar-single-select--readonly]': 'readonly()',
    '[class.coar-single-select--error]': 'hasError()',
    '[class.coar-single-select--open]': 'isOpen()',
  },
})
export class CoarSingleSelectComponent<T = unknown> extends CoarSelectBase<T | null> {
  private readonly overlayBuilder = createOverlayBuilder();
  private readonly destroyRefLocal = inject(DestroyRef);

  private readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  private readonly dropdownTemplateRef = viewChild<TemplateRef<unknown>>('dropdownTemplate');

  private overlayRef: OverlayRef | null = null;

  /** Current selected value (two-way bindable with [(value)]) */
  value = model<T | null>(null);

  /** Whether to show a clear button when a value is selected */
  clearable = input<boolean, unknown>(true, {
    transform: (v: unknown) => (v === '' ? true : Boolean(v)),
  });

  /** Emits when the selected value changes */
  valueChange = output<T | null>();

  /** CSS selector for highlighted option (used by base class scrollToHighlighted) */
  protected get highlightedOptionSelector(): string {
    return '.coar-select-option--highlighted';
  }

  /** The currently selected option object */
  protected selectedOption = computed(() => {
    const currentValue = this.value();
    if (currentValue === null || currentValue === undefined) return null;
    const compare = this.compareWith() ?? ((a: unknown, b: unknown) => a === b);
    return this.options().find((opt) => compare(opt.value, currentValue)) ?? null;
  });

  /** Whether to show the clear button */
  protected showClearButton = computed(() => {
    return this.clearable() && this.value() !== null && !this.isDisabled() && !this.readonly();
  });

  /** Display text for the current selection */
  getDisplayText(): string {
    const selected = this.selectedOption();
    return selected?.label ?? '';
  }

  /** Write value from forms API */
  writeValue(value: T | null): void {
    this.value.set(value);
  }

  /** Select an option by its value */
  selectOption(option: CoarSelectOption<T>): void {
    if (option.disabled || this.isDisabled() || this.readonly()) return;

    this.value.set(option.value);
    this.valueChange.emit(option.value);
    this.cvaOnChange(option.value);
    this.closeDropdown();
  }

  /** Select the currently highlighted option */
  protected selectHighlightedOption(): void {
    const options = this.filteredOptions();
    const index = this.highlightedIndex();

    if (index >= 0 && index < options.length) {
      const option = options[index] as CoarSelectOption<T>;
      if (!option.disabled) {
        this.selectOption(option);
      }
    }
  }

  /** Clear the current selection */
  protected clearSelection(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
    this.valueChange.emit(null);
    this.cvaOnChange(null);
  }

  /** Check if an option is currently selected */
  protected isSelected(option: CoarSelectOption): boolean {
    const compare = this.compareWith() ?? ((a: unknown, b: unknown) => a === b);
    return compare(this.value(), option.value);
  }

  protected override shouldCloseOnOutsideClick(): boolean {
    // The dropdown panel is rendered via @cocoar/ui-overlay (attached to document.body),
    // so hostElement.contains(event.target) would treat clicks inside the panel as "outside".
    // We rely on overlay dismissal (outsideClick) instead.
    return false;
  }

  protected override openDropdown(): void {
    if (this.isDisabled() || this.readonly()) return;
    if (this.overlayRef) return;

    const trigger = this.triggerRef()?.nativeElement;
    const template = this.dropdownTemplateRef();
    if (!trigger || !template) return;

    const placement = this.resolvePlacement(trigger, this.estimatePanelHeight());
    this.dropdownPosition.set(placement === 'top' ? 'top' : 'bottom');

    this.isOpen.set(true);
    this.searchQuery.set('');
    this.highlightedIndex.set(-1);

    const ref = this.overlayBuilder
      .anchor({ kind: 'element', element: trigger })
      .position({ placement, offset: 4, flip: false, shift: false })
      .scroll({ strategy: 'reposition' })
      .dismiss({ outsideClick: true, escapeKey: true })
      .size({ mode: 'content', minWidth: 'anchor' })
      .fromTemplate(template)
      .open({});
    this.overlayRef = ref;

    ref.afterClosed$.subscribe(() => {
      if (this.overlayRef !== ref) return;
      this.overlayRef = null;
      this.isOpen.set(false);
      this.searchQuery.set('');
      this.highlightedIndex.set(-1);
    });

    this.destroyRefLocal.onDestroy(() => {
      ref.close();
    });

    setTimeout(() => {
      if (!this.isOpen()) return;

      if (this.searchable()) {
        this.searchInputRef()?.nativeElement.focus();
      }

      if (this.dropdownPosition() === 'top') {
        this.scrollbarRef()?.scrollToBottom();
      }
    });
  }

  protected override closeDropdown(): void {
    const ref = this.overlayRef;
    this.overlayRef = null;
    ref?.close();
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.highlightedIndex.set(-1);
  }

  private resolvePlacement(trigger: HTMLElement, estimatedPanelHeight: number): Placement {
    const preference = this.dropdownPositionPreference();
    if (preference === 'top') return 'top';
    if (preference === 'bottom') return 'bottom';

    const viewportHeight = document.documentElement?.clientHeight || window.innerHeight;
    const rect = trigger.getBoundingClientRect();

    const spaceBelow = Math.max(0, viewportHeight - rect.bottom);
    const spaceAbove = Math.max(0, rect.top);

    if (spaceBelow < estimatedPanelHeight && spaceAbove > spaceBelow) return 'top';
    return 'bottom';
  }

  private estimatePanelHeight(): number {
    const maxListHeight = 240;
    const optionRowHeight = 36;
    const listPadding = 8;

    const optionCount = this.displayOptions().length;
    const listHeight = Math.min(maxListHeight, optionCount * optionRowHeight + listPadding);

    const searchHeight = this.searchable() ? 56 : 0;
    const chromeHeight = 2;

    return chromeHeight + searchHeight + listHeight;
  }
}
