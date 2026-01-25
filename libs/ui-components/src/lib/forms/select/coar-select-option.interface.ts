/**
 * Represents a selectable option in select components.
 *
 * @template T - The type of the option value
 */
export interface CoarSelectOption<T = unknown> {
  /** The value stored when this option is selected */
  value: T;

  /** The display label shown in the dropdown and selected state */
  label: string;

  /** Whether this option is disabled and cannot be selected */
  disabled?: boolean;

  /** Optional group this option belongs to (for grouped options) */
  group?: string;

  /** Optional icon to display next to the label */
  icon?: string;
}
