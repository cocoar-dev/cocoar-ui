# Writing Documentation for Components

This guide shows how to write JSDoc comments that generate great documentation with Compodoc.

## Why Document in Code?

**Code is the source of truth.** By documenting components with JSDoc:

- ✅ Documentation stays in sync with code
- ✅ Comp odoc generates machine-readable JSON for AI agents
- ✅ TypeScript types are automatically extracted
- ✅ Examples live next to implementation
- ✅ Reduced maintenance burden

## Component-Level Documentation

### Basic Component Doc

```typescript
/**
 * Primary button component with support for icons, loading states, and variants.
 *
 * Buttons trigger actions when clicked and can display loading states or
 * icons alongside text labels.
 *
 * @example
 * ```html
 * <coar-button variant="primary" (clicked)="save()">
 *   Save Changes
 * </coar-button>
 * ```
 *
 * @example With icon
 * ```html
 * <coar-button variant="secondary" iconStart="plus">
 *   Add Item
 * </coar-button>
 * ```
 */
@Component({
  selector: 'coar-button',
  // ...
})
export class CoarButtonComponent {
  // ...
}
```

### Supported JSDoc Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `@example` | Show usage examples | `@example <coar-button>Click</coar-button>` |
| `@see` | Link to related docs | `@see CoarIconComponent` |
| `@deprecated` | Mark as deprecated | `@deprecated Use CoarButton2 instead` |
| `@usageNotes` | Additional usage info | `@usageNotes Requires CoarTokens CSS` |

## Input Documentation

Document **every** public input with JSDoc:

```typescript
/** Button visual variant */
variant = input<ButtonVariant>('primary');

/**
 * Button size
 *
 * Controls height, padding, and font size to match design tokens.
 * Use 'md' for standard forms, 'lg' for hero sections.
 */
size = input<ButtonSize>('md');

/**
 * Whether the button is disabled
 *
 * Disabled buttons:
 * - Cannot be clicked
 * - Don't emit the clicked event
 * - Show reduced opacity
 * - Are not keyboard focusable
 */
disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

/**
 * Icon to display before the label
 *
 * @example
 * ```html
 * <coar-button iconStart="plus">Add</coar-button>
 * ```
 *
 * @see CoreIconName for available icons
 */
iconStart = input<string | undefined>(undefined);
```

## Output Documentation

Document outputs with their purpose and when they fire:

```typescript
/**
 * Emitted when the button is clicked
 *
 * This event is NOT emitted when:
 * - Button is disabled
 * - Button is in loading state
 *
 * @example
 * ```html
 * <coar-button (clicked)="handleClick($event)">
 *   Click Me
 * </coar-button>
 * ```
 */
clicked = output<MouseEvent>();

/**
 * Emitted when selection changes
 *
 * Fires whenever the user selects or deselects options.
 * The event contains the full array of currently selected values.
 */
selectionChange = output<string[]>();
```

## Method Documentation

Document public methods that consumers might use:

```typescript
/**
 * Programmatically focus the button
 *
 * Useful for accessibility when managing focus after modal closes.
 *
 * @example
 * ```typescript
 * @ViewChild(CoarButtonComponent) button!: CoarButtonComponent;
 *
 * closeModal() {
 *   this.modalService.close();
 *   this.button.focus();
 * }
 * ```
 */
focus(): void {
  this.elementRef.nativeElement.focus();
}
```

## Type Documentation

Document type aliases and interfaces:

```typescript
/**
 * Button visual variants
 *
 * - `primary`: Main call-to-action (e.g., Save, Submit)
 * - `secondary`: Secondary actions (e.g., Cancel)
 * - `tertiary`: Low-emphasis actions
 * - `danger`: Destructive actions (e.g., Delete)
 * - `ghost`: Minimal visual weight
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';

/**
 * Select option structure
 *
 * @example
 * ```typescript
 * const options: CoarSelectOption[] = [
 *   { value: 'us', label: 'United States' },
 *   { value: 'uk', label: 'United Kingdom', disabled: true }
 * ];
 * ```
 */
export interface CoarSelectOption {
  /** Unique value for this option */
  value: string;

  /** Display label shown to users */
  label: string;

  /** Whether this option cannot be selected */
  disabled?: boolean;

  /** Optional group this option belongs to */
  group?: string;
}
```

## Accessibility Documentation

Always document accessibility features:

```typescript
/**
 * Checkbox component with full keyboard and screen reader support.
 *
 * ## Accessibility
 *
 * - **Keyboard**: Space toggles checked state
 * - **Screen readers**: Announces label, state, and error messages
 * - **ARIA**: Uses semantic `<input type="checkbox">` with proper labeling
 * - **Focus**: Visible focus indicator follows design tokens
 *
 * ## Required/Optional
 *
 * Use the `required` input to mark as required and show asterisk.
 * Screen readers will announce "required" state automatically.
 *
 * @example With error
 * ```html
 * <coar-checkbox
 *   label="I accept terms"
 *   [required]="true"
 *   error="You must accept terms to continue">
 * </coar-checkbox>
 * ```
 */
@Component({
  selector: 'coar-checkbox',
  // ...
})
export class CoarCheckboxComponent {
  // ...
}
```

## Design Token Documentation

Reference design tokens where relevant:

```typescript
/**
 * Card color scheme
 *
 * Maps to CSS variables:
 * - `neutral`: `--coar-color-neutral-*`
 * - `success`: `--coar-color-success-*`
 * - `warning`: `--coar-color-warning-*`
 * - `error`: `--coar-color-error-*`
 * - `info`: `--coar-color-info-*`
 * - `accent`: `--coar-color-accent-*`
 *
 * @see @cocoar/ui-tokens for complete token reference
 */
color = input<CardColor>('neutral');
```

## What NOT to Document

❌ **Don't document**:
- Private/protected members (Compodoc ignores them anyway)
- Obvious getters/setters
- Implementation details
- What the code does (self-explanatory code is better)

✅ **DO document**:
- **Why** decisions were made
- **How** to use the API
- **When** events fire
- **What** side effects occur
- **Where** to find more information

## Documentation Checklist

When adding or updating a component:

- [ ] Component has description and `@example`
- [ ] All public inputs documented
- [ ] All outputs documented (including when they fire)
- [ ] Public methods documented
- [ ] Accessibility features explained
- [ ] Design tokens referenced where relevant
- [ ] Type aliases/interfaces documented
- [ ] Examples show real-world usage
- [ ] Run `pnpm docs:api` to generate/update JSON

## See Also

- [Compodoc Documentation](https://compodoc.app/)
- [TSDoc Standard](https://tsdoc.org/)
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - Architecture guidelines
- [NAMING.md](../../NAMING.md) - Naming conventions
