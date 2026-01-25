import {
  signal,
  input,
  computed,
  effect,
  ElementRef,
  inject,
  booleanAttribute,
  DestroyRef,
  Directive,
  viewChild,
} from '@angular/core';
import { CoarControlValueAccessor } from '../_base/coar-control-value-accessor';
import { CoarScrollbarDirective } from '../../display/scrollbar/coar-scrollbar.directive';
import { CoarSelectOption } from './coar-select-option.interface';

export type CoarSelectSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Visual appearance of the select trigger.
 * - 'outline': Default bordered input style
 * - 'inline': Borderless, transparent background - blends into surrounding content
 */
export type CoarSelectAppearance = 'outline' | 'inline';

/** Dropdown position relative to the trigger */
export type CoarDropdownPosition = 'top' | 'bottom';

/**
 * Base class providing shared functionality for all select components.
 * Handles dropdown state, keyboard navigation, and common styling.
 * Subclasses override openDropdown() to use the overlay system.
 */
@Directive()
export abstract class CoarSelectBase<T> extends CoarControlValueAccessor<T> {
  protected readonly elementRef = inject(ElementRef);
  protected readonly destroyRef = inject(DestroyRef);

  /** Label text displayed above the select */
  label = input<string>('');

  /** Placeholder text shown when no option is selected */
  placeholder = input<string>('Select an option...');

  /** Available options to choose from */
  options = input<CoarSelectOption[]>([]);

  /** Select size - matches button/input heights for consistent layouts */
  size = input<CoarSelectSize>('md');

  /**
   * Visual appearance of the select trigger.
   * - 'outline': Default bordered input style
   * - 'inline': Borderless, transparent - blends into surrounding content
   */
  appearance = input<CoarSelectAppearance>('outline');

  /** Disables the select (greyed out, not focusable) */
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Makes the select read-only (focusable but not editable) */
  readonly = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Marks the select as required, shows asterisk on label */
  required = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Error message to display below the select */
  error = input<string>('');

  /** Hint text displayed below the select */
  hint = input<string>('');

  /** HTML id attribute for the select element */
  id = input<string>('');

  /** HTML name attribute for form submission */
  name = input<string>('');

  /** Enable search/filter functionality within the dropdown */
  searchable = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Search input placeholder when searchable is enabled */
  searchPlaceholder = input<string>('Search...');

  /**
   * Comparison function to match values with options.
   * Use this when value objects come from different sources (e.g., API vs form).
   *
   * @example
   * ```typescript
   * // Compare Country objects by their ID
   * compareById = (a: Country | null, b: Country | null) => a?.id === b?.id;
   * ```
   */
  compareWith = input<(o1: unknown, o2: unknown) => boolean>();

  /** Force dropdown position ('auto' calculates based on available space) */
  dropdownPositionPreference = input<'auto' | 'top' | 'bottom'>('auto');

  // ============================================================
  // View References (shared across all select components)
  // ============================================================

  /** Reference to the scrollbar directive for scroll control */
  protected scrollbarRef = viewChild(CoarScrollbarDirective);

  /** Reference to the options list container for scroll-into-view */
  protected optionsListRef = viewChild<ElementRef<HTMLDivElement>>('optionsList');

  /** Reference to the search input for focusing (when searchable) */
  protected searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** DOM id for the dropdown search input (when searchable). */
  protected searchInputId = computed(() => `${this.inputId()}-search`);

  // ============================================================
  // Internal State
  // ============================================================

  /** Whether the dropdown is currently open */
  protected isOpen = signal(false);

  /** Whether the select is focused */
  protected isFocused = signal(false);

  /** Current search/filter query */
  protected searchQuery = signal('');

  /** Currently highlighted option index for keyboard navigation */
  protected highlightedIndex = signal(-1);

  /** Current dropdown position */
  protected dropdownPosition = signal<CoarDropdownPosition>('bottom');

  /** Combined disabled state from input and CVA */
  protected isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  /** Whether there's an error to display */
  protected hasError = computed(() => this.error().length > 0);

  /** Message to display (error takes priority over hint) */
  protected displayMessage = computed(() => this.error() || this.hint());

  /** Generated unique ID for the select element */
  protected inputId = computed(
    () => this.id() || `coar-select-${Math.random().toString(36).substr(2, 9)}`
  );

  /** ID for the message element (for aria-describedby) */
  protected messageId = computed(() => `${this.inputId()}-message`);

  /** ID for the listbox element */
  protected listboxId = computed(() => `${this.inputId()}-listbox`);

  /** Filtered options based on search query */
  protected filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.options();
    return this.options().filter((option) => option.label.toLowerCase().includes(query));
  });

  /**
   * Options for display, reversed when dropdown opens to top.
   * This ensures the first option is always nearest to the trigger.
   */
  protected displayOptions = computed(() => {
    const options = this.filteredOptions();
    if (this.dropdownPosition() === 'top') {
      // Reverse to place first option at visual bottom (nearest to trigger)
      return options.slice().reverse();
    }
    return options;
  });

  /**
   * Check if a display index is highlighted.
   * When reversed, converts display index to data index.
   */
  protected isHighlighted(displayIndex: number): boolean {
    const dataIndex =
      this.dropdownPosition() === 'top'
        ? this.filteredOptions().length - 1 - displayIndex
        : displayIndex;
    return this.highlightedIndex() === dataIndex;
  }

  /**
   * Set highlight from display index.
   * When reversed, converts display index to data index.
   */
  protected setHighlightFromDisplay(displayIndex: number): void {
    const dataIndex =
      this.dropdownPosition() === 'top'
        ? this.filteredOptions().length - 1 - displayIndex
        : displayIndex;
    this.highlightedIndex.set(dataIndex);
  }

  constructor() {
    super();

    // Reset highlighted index when options change
    effect(() => {
      this.filteredOptions();
      this.highlightedIndex.set(-1);
    });

    // Close dropdown on outside click (can be disabled by subclasses that render the panel outside host DOM).
    this.installOutsideClickHandler();
  }

  /** Toggle dropdown open/closed state */
  protected toggleDropdown(): void {
    if (this.isDisabled() || this.readonly()) return;

    if (this.isOpen()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Open the dropdown.
   * Subclasses MUST override this method to implement overlay-based dropdown.
   */
  protected openDropdown(): void {
    // Base implementation intentionally empty - always overridden by subclasses
  }

  /**
   * Close the dropdown.
   * Subclasses MUST override this method to implement overlay-based dropdown.
   */
  protected closeDropdown(): void {
    // Base implementation intentionally empty - always overridden by subclasses
  }

  /** Handle keyboard navigation */
  protected onKeyDown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.readonly()) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        if (!this.isOpen()) {
          event.preventDefault();
          this.openDropdown();
          // Auto-highlight first option when opening
          this.highlightFirstOption();
        } else if (this.highlightedIndex() >= 0) {
          event.preventDefault();
          this.selectHighlightedOption();
        }
        break;

      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.closeDropdown();
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
          // When opening, highlight option farthest from trigger
          if (this.dropdownPosition() === 'bottom') {
            this.highlightFirstOption();
          } else {
            // Top dropdown is visually reversed, so last index appears at visual top
            this.highlightLastOption();
          }
        } else {
          // ArrowDown always moves DOWN visually
          // Bottom dropdown: down = next index; Top dropdown (reversed): down = previous index
          if (this.dropdownPosition() === 'bottom') {
            this.highlightNextOption();
          } else {
            this.highlightPreviousOption();
          }
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
          // When opening, highlight option nearest to trigger
          if (this.dropdownPosition() === 'top') {
            // Top dropdown is visually reversed, so first index appears at visual bottom (nearest)
            this.highlightFirstOption();
          } else {
            this.highlightLastOption();
          }
        } else {
          // ArrowUp always moves UP visually
          // Bottom dropdown: up = previous index; Top dropdown (reversed): up = next index
          if (this.dropdownPosition() === 'bottom') {
            this.highlightPreviousOption();
          } else {
            this.highlightNextOption();
          }
        }
        break;

      case 'Home':
        if (this.isOpen()) {
          event.preventDefault();
          this.highlightFirstOption();
        }
        break;

      case 'End':
        if (this.isOpen()) {
          event.preventDefault();
          this.highlightLastOption();
        }
        break;

      case 'Tab':
        if (this.isOpen()) {
          this.closeDropdown();
        }
        break;
    }
  }

  /** Move highlight to the next available option */
  protected highlightNextOption(): void {
    const options = this.filteredOptions();
    let nextIndex = this.highlightedIndex() + 1;

    while (nextIndex < options.length) {
      if (!options[nextIndex].disabled) {
        this.highlightedIndex.set(nextIndex);
        this.scrollToHighlighted();
        return;
      }
      nextIndex++;
    }
  }

  /** Move highlight to the previous available option */
  protected highlightPreviousOption(): void {
    const options = this.filteredOptions();
    let prevIndex = this.highlightedIndex() - 1;

    while (prevIndex >= 0) {
      if (!options[prevIndex].disabled) {
        this.highlightedIndex.set(prevIndex);
        this.scrollToHighlighted();
        return;
      }
      prevIndex--;
    }
  }

  /** Move highlight to the first available option */
  protected highlightFirstOption(): void {
    const options = this.filteredOptions();
    for (let i = 0; i < options.length; i++) {
      if (!options[i].disabled) {
        this.highlightedIndex.set(i);
        this.scrollToHighlighted();
        return;
      }
    }
  }

  /** Move highlight to the last available option */
  protected highlightLastOption(): void {
    const options = this.filteredOptions();
    for (let i = options.length - 1; i >= 0; i--) {
      if (!options[i].disabled) {
        this.highlightedIndex.set(i);
        this.scrollToHighlighted();
        return;
      }
    }
  }

  /** Scroll the highlighted option into view */
  protected scrollToHighlighted(): void {
    setTimeout(() => {
      const listEl = this.getOptionsListElement();
      const selector = this.highlightedOptionSelector;
      const highlightedEl = listEl?.querySelector(selector);
      highlightedEl?.scrollIntoView({ block: 'nearest' });
    });
  }

  protected focusSearchInput(): void {
    if (!this.searchable()) return;

    const refEl = this.searchInputRef()?.nativeElement;
    if (refEl) {
      refEl.focus();
      return;
    }

    const domEl =
      typeof document !== 'undefined'
        ? (document.getElementById(this.searchInputId()) as HTMLInputElement | null)
        : null;

    domEl?.focus();
  }

  protected scrollOptionsToBottom(): void {
    const scrollbar = this.scrollbarRef();
    if (scrollbar) {
      scrollbar.scrollToBottom();
      return;
    }

    const listEl = this.getOptionsListElement();
    if (!listEl) return;
    listEl.scrollTop = listEl.scrollHeight;
  }

  protected getOptionsListElement(): HTMLDivElement | null {
    const refEl = this.optionsListRef()?.nativeElement;
    if (refEl) return refEl;

    return typeof document !== 'undefined'
      ? (document.getElementById(this.listboxId()) as HTMLDivElement | null)
      : null;
  }

  /**
   * CSS selector for the highlighted option element.
   * Each component defines its own selector based on its CSS class naming.
   */
  protected abstract get highlightedOptionSelector(): string;

  /** Handle focus event */
  protected onFocus(): void {
    this.isFocused.set(true);
  }

  /** Handle blur event */
  protected onBlur(): void {
    this.isFocused.set(false);
    this.cvaOnTouched();
  }

  /** Handle search input changes */
  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.highlightedIndex.set(-1);
  }

  /** Whether this select should close on document clicks outside its host element. */
  protected shouldCloseOnOutsideClick(): boolean {
    return true;
  }

  /** Setup click outside handler to close dropdown. */
  protected installOutsideClickHandler(): void {
    if (!this.shouldCloseOnOutsideClick()) return;

    const handleClick = (event: MouseEvent) => {
      if (!this.isOpen()) return;
      if (this.elementRef.nativeElement.contains(event.target)) return;
      this.closeDropdown();
    };

    // Use setTimeout to avoid issues with the current click event
    setTimeout(() => {
      document.addEventListener('click', handleClick);
      this.destroyRef.onDestroy(() => {
        document.removeEventListener('click', handleClick);
      });
    });
  }

  /** Abstract method to select the currently highlighted option */
  protected abstract selectHighlightedOption(): void;

  /** Abstract method to get the display text for the current selection */
  abstract getDisplayText(): string;
}
