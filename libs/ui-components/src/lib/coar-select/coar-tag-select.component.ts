import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  computed,
  viewChild,
  ElementRef,
  booleanAttribute,
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
 * Tag-based multi-select component.
 *
 * Displays selected items as removable tag chips with support for
 * creating new tags on-the-fly (optional), keyboard navigation,
 * and full forms integration.
 *
 * @example
 * ```html
 * <coar-tag-select
 *   label="Tags"
 *   [options]="availableTags"
 *   [(value)]="selectedTags"
 *   [allowCreate]="true"
 *   placeholder="Add tags..."
 * />
 * ```
 */
@Component({
  selector: 'coar-tag-select',
  standalone: true,
  imports: [FormsModule, CoarIconComponent, CoarScrollbarDirective],
  templateUrl: './coar-tag-select.component.html',
  styleUrl: './coar-tag-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarTagSelectComponent)],
  host: {
    '[class.coar-tag-select--xs]': 'size() === "xs"',
    '[class.coar-tag-select--sm]': 'size() === "sm"',
    '[class.coar-tag-select--md]': 'size() === "md"',
    '[class.coar-tag-select--lg]': 'size() === "lg"',
    '[class.coar-tag-select--disabled]': 'isDisabled()',
    '[class.coar-tag-select--readonly]': 'readonly()',
    '[class.coar-tag-select--error]': 'hasError()',
    '[class.coar-tag-select--open]': 'isOpen()',
    '[class.coar-tag-select--focused]': 'isFocused()',
  },
})
export class CoarTagSelectComponent<T = string> extends CoarSelectBase<T[]> {
  private readonly overlayBuilder = createOverlayBuilder();

  private readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  private readonly dropdownTemplateRef = viewChild<TemplateRef<unknown>>('dropdownTemplate');

  private overlayRef: OverlayRef | null = null;

  /** Current selected values (two-way bindable with [(value)]) */
  value = model<T[]>([]);

  /** Allow creating new tags that don't exist in options */
  allowCreate = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Maximum number of tags that can be selected (0 = unlimited) */
  maxTags = input<number>(0);

  /** Text shown when creating a new tag */
  createPrefix = input<string>('Create: ');

  /** Emits when the selected values change */
  valueChange = output<T[]>();

  /** Emits when a new tag is created */
  tagCreated = output<T>();

  /**
   * Reference to the inline search input (tag-select uses inline input, not dropdown search).
   * This is separate from the base class searchInputRef.
   */
  protected inlineInputRef = viewChild<ElementRef<HTMLInputElement>>('inlineInput');

  /** CSS selector for highlighted option (used by base class scrollToHighlighted) */
  protected get highlightedOptionSelector(): string {
    return '.coar-tag-option--highlighted';
  }

  /** The currently selected option objects */
  protected selectedOptions = computed(() => {
    const currentValues = this.value();
    if (!currentValues.length) return [];
    const compare = this.compareWith() ?? ((a: unknown, b: unknown) => a === b);

    // Map values to options, creating virtual options for created tags or unknown values
    return currentValues.map((val) => {
      const existing = this.options().find((opt) => compare(opt.value, val));
      if (existing) return existing;

      // Created tag or value without matching option - return a virtual option
      return {
        value: val,
        label: String(val),
      } as CoarSelectOption<T>;
    });
  });

  /** Available options that aren't already selected */
  protected availableOptions = computed(() => {
    const selectedValues = this.value();
    const compare = this.compareWith() ?? ((a: unknown, b: unknown) => a === b);
    return this.filteredOptions().filter(
      (opt) => !selectedValues.some((val) => compare(val, opt.value))
    );
  });

  /**
   * Available options for display, reversed when dropdown opens to top.
   * This ensures the first option is always nearest to the trigger.
   */
  protected displayAvailableOptions = computed(() => {
    const options = this.availableOptions();
    if (this.dropdownPosition() === 'top') {
      // Reverse to place first option at visual bottom (nearest to trigger)
      return options.slice().reverse();
    }
    return options;
  });

  /**
   * Check if a display index is highlighted (for availableOptions).
   * When reversed, converts display index to data index.
   */
  protected isAvailableHighlighted(displayIndex: number): boolean {
    const dataIndex =
      this.dropdownPosition() === 'top'
        ? this.availableOptions().length - 1 - displayIndex
        : displayIndex;
    return this.highlightedIndex() === dataIndex;
  }

  /**
   * Set highlight from display index (for availableOptions).
   * When reversed, converts display index to data index.
   */
  protected setAvailableHighlightFromDisplay(displayIndex: number): void {
    const dataIndex =
      this.dropdownPosition() === 'top'
        ? this.availableOptions().length - 1 - displayIndex
        : displayIndex;
    this.highlightedIndex.set(dataIndex);
  }

  /** Whether the max tags limit has been reached */
  protected maxReached = computed(() => {
    const max = this.maxTags();
    return max > 0 && this.value().length >= max;
  });

  /** Whether to show the "Create" option */
  protected showCreateOption = computed(() => {
    const query = this.searchQuery().trim();
    if (!this.allowCreate() || !query || this.maxReached()) return false;

    // Check if the query matches an existing option exactly
    const exactMatch = this.options().some(
      (opt) => opt.label.toLowerCase() === query.toLowerCase()
    );
    if (exactMatch) return false;

    // Check if already selected
    const alreadySelected = this.value().some(
      (val) => String(val).toLowerCase() === query.toLowerCase()
    );
    return !alreadySelected;
  });

  /** Display text for the current selection */
  getDisplayText(): string {
    return this.selectedOptions()
      .map((opt) => opt.label)
      .join(', ');
  }

  /** Write value from forms API */
  writeValue(value: T[] | null): void {
    this.value.set(value ?? []);
  }

  /** Add a tag from an option */
  addTag(option: CoarSelectOption<T>): void {
    if (option.disabled || this.isDisabled() || this.readonly() || this.maxReached()) return;

    const currentValues = [...this.value()];
    const compare = this.compareWith() ?? ((a: unknown, b: unknown) => a === b);
    const alreadySelected = currentValues.some((val) => compare(val, option.value));

    if (!alreadySelected) {
      currentValues.push(option.value);
      this.value.set(currentValues);
      this.valueChange.emit(currentValues);
      this.cvaOnChange(currentValues);
    }

    this.searchQuery.set('');
    this.highlightedIndex.set(-1);
  }

  /** Remove a tag by value */
  removeTag(tagValue: T, event?: Event): void {
    event?.stopPropagation();
    if (this.isDisabled() || this.readonly()) return;

    const compare = this.compareWith() ?? ((a: unknown, b: unknown) => a === b);
    const currentValues = this.value().filter((v) => !compare(v, tagValue));
    this.value.set(currentValues);
    this.valueChange.emit(currentValues);
    this.cvaOnChange(currentValues);
  }

  /** Create a new tag from the search query */
  protected createTag(): void {
    if (!this.allowCreate() || this.maxReached()) return;

    const query = this.searchQuery().trim();
    if (!query) return;

    const newValue = query as unknown as T;
    const currentValues = [...this.value()];

    if (!currentValues.includes(newValue)) {
      currentValues.push(newValue);
      this.value.set(currentValues);
      this.valueChange.emit(currentValues);
      this.cvaOnChange(currentValues);
      this.tagCreated.emit(newValue);
    }

    this.searchQuery.set('');
    this.highlightedIndex.set(-1);
  }

  /** Select the currently highlighted option */
  protected selectHighlightedOption(): void {
    const available = this.availableOptions();
    const index = this.highlightedIndex();

    // Check if highlighting the "Create" option
    if (this.showCreateOption() && index === available.length) {
      this.createTag();
      return;
    }

    if (index >= 0 && index < available.length) {
      const option = available[index] as CoarSelectOption<T>;
      if (!option.disabled) {
        this.addTag(option);
      }
    }
  }

  /** Handle keyboard for tag-select */
  protected override onKeyDown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.readonly()) return;

    switch (event.key) {
      case 'Backspace':
        if (!this.searchQuery() && this.value().length > 0) {
          // Remove last tag
          const lastValue = this.value()[this.value().length - 1];
          this.removeTag(lastValue);
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex() >= 0) {
          this.selectHighlightedOption();
        } else if (this.showCreateOption()) {
          this.createTag();
        }
        break;

      case ',':
      case 'Tab':
        if (this.showCreateOption() && this.searchQuery().trim()) {
          event.preventDefault();
          this.createTag();
        } else if (event.key === 'Tab') {
          this.closeDropdown();
        }
        break;

      default:
        super.onKeyDown(event);
    }
  }

  /** Handle input changes */
  protected onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.highlightedIndex.set(-1);

    if (!this.isOpen() && target.value) {
      this.openDropdown();
    }
  }

  /** Focus the inline input */
  protected focusInput(): void {
    if (!this.isDisabled() && !this.readonly()) {
      this.inlineInputRef()?.nativeElement.focus();
    }
  }

  /** Handle input focus */
  protected onInputFocus(): void {
    this.isFocused.set(true);
    if (!this.maxReached()) {
      this.openDropdown();
    }
  }

  /** Handle input blur */
  protected onInputBlur(): void {
    this.isFocused.set(false);
    this.cvaOnTouched();
  }

  /** Override to calculate highlighted index including create option */
  protected override highlightNextOption(): void {
    const available = this.availableOptions();
    const maxIndex = this.showCreateOption() ? available.length : available.length - 1;
    let nextIndex = this.highlightedIndex() + 1;

    while (nextIndex <= maxIndex) {
      // Create option is always enabled
      if (nextIndex === available.length && this.showCreateOption()) {
        this.highlightedIndex.set(nextIndex);
        this.scrollToHighlighted();
        return;
      }

      if (nextIndex < available.length && !available[nextIndex].disabled) {
        this.highlightedIndex.set(nextIndex);
        this.scrollToHighlighted();
        return;
      }
      nextIndex++;
    }
  }

  /** Scroll highlighted option into view */
  protected override scrollToHighlighted(): void {
    setTimeout(() => {
      const listEl = this.getOptionsListElement();
      const highlightedEl = listEl?.querySelector('.coar-tag-option--highlighted');
      highlightedEl?.scrollIntoView({ block: 'nearest' });
    });
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
    this.highlightedIndex.set(-1);

    // Build panel class based on size
    const sizeClass = `coar-select-dropdown--${this.size()}`;

    const ref = this.overlayBuilder
      .anchor({ kind: 'element', element: trigger })
      .position({ placement, offset: 4, flip: false, shift: false })
      .scroll({ strategy: 'reposition' })
      .dismiss({ outsideClick: true, escapeKey: true })
      .size({ mode: 'content', minWidth: 'anchor' })
      .panelClass(sizeClass)
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
    const maxListHeight = 200;
    const optionRowHeight = 36;
    const listPadding = 8;

    const optionCount = this.displayAvailableOptions().length + (this.showCreateOption() ? 1 : 0);
    const listHeight = Math.min(maxListHeight, optionCount * optionRowHeight + listPadding);

    const chromeHeight = 2;
    return chromeHeight + listHeight;
  }
}
