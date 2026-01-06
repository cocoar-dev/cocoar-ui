import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  computed,
  viewChild,
  ElementRef,
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
 * Multi-select dropdown component.
 *
 * Allows selecting multiple options from a list with checkboxes,
 * keyboard navigation, search/filter support, and full forms integration.
 *
 * @example
 * ```html
 * <coar-multi-select
 *   label="Skills"
 *   [options]="skills"
 *   [(value)]="selectedSkills"
 *   placeholder="Select skills..."
 * />
 * ```
 */
@Component({
  selector: 'coar-multi-select',
  standalone: true,
  imports: [FormsModule, CoarIconComponent, CoarScrollbarDirective],
  templateUrl: './coar-multi-select.component.html',
  styleUrl: './coar-multi-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarMultiSelectComponent)],
  host: {
    '[class.coar-multi-select--xs]': 'size() === "xs"',
    '[class.coar-multi-select--sm]': 'size() === "sm"',
    '[class.coar-multi-select--md]': 'size() === "md"',
    '[class.coar-multi-select--lg]': 'size() === "lg"',
    '[class.coar-multi-select--disabled]': 'isDisabled()',
    '[class.coar-multi-select--readonly]': 'readonly()',
    '[class.coar-multi-select--error]': 'hasError()',
    '[class.coar-multi-select--open]': 'isOpen()',
  },
})
export class CoarMultiSelectComponent<T = unknown> extends CoarSelectBase<T[]> {
  private readonly overlayBuilder = createOverlayBuilder();

  private readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  private readonly dropdownTemplateRef = viewChild<TemplateRef<unknown>>('dropdownTemplate');

  private overlayRef: OverlayRef | null = null;

  /** Current selected values (two-way bindable with [(value)]) */
  value = model<T[]>([]);

  /** Whether to show a clear button when values are selected */
  clearable = input<boolean, unknown>(true, {
    transform: (v: unknown) => (v === '' ? true : Boolean(v)),
  });

  /** Maximum number of selected items to display before showing count */
  maxDisplayItems = input<number>(3);

  /** Whether to show "Select All" option */
  showSelectAll = input<boolean, unknown>(false, {
    transform: (v: unknown) => (v === '' ? true : Boolean(v)),
  });

  /** Emits when the selected values change */
  valueChange = output<T[]>();

  /** CSS selector for highlighted option (used by base class scrollToHighlighted) */
  protected get highlightedOptionSelector(): string {
    return '.coar-multi-option--highlighted';
  }

  /** The currently selected option objects */
  protected selectedOptions = computed(() => {
    const currentValues = this.value();
    if (!currentValues.length) return [];
    const compare = this.compareWith() ?? ((a: unknown, b: unknown) => a === b);
    return this.options().filter((opt) => currentValues.some((val) => compare(val, opt.value)));
  });

  /** Whether to show the clear button */
  protected showClearButton = computed(() => {
    return this.clearable() && this.value().length > 0 && !this.isDisabled() && !this.readonly();
  });

  /** Whether all options are selected */
  protected allSelected = computed(() => {
    const enabledOptions = this.options().filter((opt) => !opt.disabled);
    return enabledOptions.length > 0 && enabledOptions.every((opt) => this.isSelected(opt));
  });

  /** Whether some but not all options are selected */
  protected someSelected = computed(() => {
    const enabledOptions = this.options().filter((opt) => !opt.disabled);
    const selectedCount = enabledOptions.filter((opt) => this.isSelected(opt)).length;
    return selectedCount > 0 && selectedCount < enabledOptions.length;
  });

  /** Display text for the current selection */
  getDisplayText(): string {
    const currentValues = this.value();
    if (currentValues.length === 0) return '';

    const selected = this.selectedOptions();
    const compare = this.compareWith() ?? ((a: unknown, b: unknown) => a === b);

    // Get labels from matching options
    const labels = currentValues.map((val) => {
      const opt = selected.find((o) => compare(o.value, val));
      return opt?.label ?? String(val);
    });

    if (labels.length <= this.maxDisplayItems()) {
      return labels.join(', ');
    }
    return `${labels.length} selected`;
  }

  /** Write value from forms API */
  writeValue(value: T[] | null): void {
    this.value.set(value ?? []);
  }

  /** Toggle selection of an option */
  toggleOption(option: CoarSelectOption<T>, event?: Event): void {
    event?.stopPropagation();
    if (option.disabled || this.isDisabled() || this.readonly()) return;

    const currentValues = [...this.value()];
    const compare = this.compareWith() ?? ((a: unknown, b: unknown) => a === b);
    const index = currentValues.findIndex((val) => compare(val, option.value));

    if (index === -1) {
      currentValues.push(option.value);
    } else {
      currentValues.splice(index, 1);
    }

    this.value.set(currentValues);
    this.valueChange.emit(currentValues);
    this.cvaOnChange(currentValues);
  }

  /** Select the currently highlighted option */
  protected selectHighlightedOption(): void {
    const options = this.filteredOptions();
    const index = this.highlightedIndex();

    if (index >= 0 && index < options.length) {
      const option = options[index] as CoarSelectOption<T>;
      if (!option.disabled) {
        this.toggleOption(option);
      }
    }
  }

  /** Toggle all options */
  protected toggleAll(event?: Event): void {
    event?.stopPropagation();
    if (this.isDisabled() || this.readonly()) return;

    if (this.allSelected()) {
      // Deselect all
      this.value.set([]);
    } else {
      // Select all non-disabled options
      const allValues = this.options()
        .filter((opt) => !opt.disabled)
        .map((opt) => opt.value as T);
      this.value.set(allValues);
    }

    this.valueChange.emit(this.value());
    this.cvaOnChange(this.value());
  }

  /** Clear all selections */
  protected clearSelection(event: Event): void {
    event.stopPropagation();
    this.value.set([]);
    this.valueChange.emit([]);
    this.cvaOnChange([]);
  }

  /** Check if an option is currently selected */
  protected isSelected(option: CoarSelectOption): boolean {
    const compare = this.compareWith() ?? ((a: unknown, b: unknown) => a === b);
    return this.value().some((val) => compare(val, option.value));
  }

  /** Handle keyboard for multi-select (space toggles instead of closing) */
  protected override onKeyDown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.readonly()) return;

    if (event.key === ' ' && this.isOpen() && this.highlightedIndex() >= 0) {
      event.preventDefault();
      this.selectHighlightedOption();
      return;
    }

    if (event.key === 'Enter' && this.isOpen()) {
      event.preventDefault();
      if (this.highlightedIndex() >= 0) {
        this.selectHighlightedOption();
      } else {
        this.closeDropdown();
      }
      return;
    }

    super.onKeyDown(event);
  }

  protected override shouldCloseOnOutsideClick(): boolean {
    // Dropdown is rendered via @cocoar/ui-overlay (attached to document.body), so hostElement.contains()
    // would treat interactions within the panel as "outside".
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

    this.destroyRef.onDestroy(() => {
      ref.close();
    });

    setTimeout(() => {
      if (!this.isOpen()) return;
      this.focusSearchInput();
      if (this.dropdownPosition() === 'top') {
        this.scrollOptionsToBottom();
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

    const selectAllHeight = this.showSelectAll() && !this.searchQuery() ? 37 : 0;

    const chromeHeight = 2;
    return chromeHeight + searchHeight + selectAllHeight + listHeight;
  }
}
