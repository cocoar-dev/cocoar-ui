import {
  ChangeDetectionStrategy,
  Component,
  input,
  TemplateRef,
  Type,
  viewChild,
  booleanAttribute,
} from '@angular/core';

/**
 * Loading strategy for tab content:
 * - 'lazy': Content is only rendered when tab is active (default)
 * - 'eager': Content is always rendered, hidden when inactive
 */
export type TabLoadingStrategy = 'eager' | 'lazy';

/**
 * Content type that can be passed to a tab.
 * Either a TemplateRef (from ng-template) or a Component class.
 */
export type TabContent = TemplateRef<unknown> | Type<unknown>;

/**
 * Individual tab definition for use within CoarTabGroup.
 *
 * The tab label is provided as content projected into the component.
 * This allows simple text, icons, badges, or any custom HTML.
 *
 * @example Simple text label
 * ```html
 * <coar-tab id="home" [content]="homeTemplate">Home</coar-tab>
 * ```
 *
 * @example With icon
 * ```html
 * <coar-tab id="settings" [content]="SettingsComponent">⚙️ Settings</coar-tab>
 * ```
 *
 * @example Rich label with badge
 * ```html
 * <coar-tab id="messages" [content]="messagesTemplate">
 *   Messages <span class="badge">5</span>
 * </coar-tab>
 * ```
 */
@Component({
  selector: 'coar-tab',
  standalone: true,
  template: `<ng-template #labelContent><ng-content /></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarTabComponent {
  /** Unique identifier for the tab */
  id = input.required<string>();

  /** Whether the tab is disabled */
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  /**
   * The content to display in the tab panel.
   * Can be either a TemplateRef (from ng-template) or a Component class.
   */
  content = input.required<TabContent>();

  /**
   * Inputs to pass when content is a Component.
   * Ignored when content is a TemplateRef.
   */
  contentInputs = input<Record<string, unknown>>({});

  /**
   * Loading strategy for the tab content.
   * - 'lazy' (default): Content is only rendered when tab becomes active
   * - 'eager': Content is always rendered, just hidden when inactive
   */
  loadingStrategy = input<TabLoadingStrategy>('lazy');

  /** Template reference for the projected label content */
  labelTemplate = viewChild.required<TemplateRef<unknown>>('labelContent');

  /**
   * Whether the content is a Component (vs a TemplateRef)
   */
  get isComponent(): boolean {
    const c = this.content();
    return typeof c === 'function';
  }

  /**
   * Get content as TemplateRef (returns null if it's a component)
   */
  get templateContent(): TemplateRef<unknown> | null {
    const c = this.content();
    return typeof c === 'function' ? null : c;
  }

  /**
   * Get content as Component type (returns null if it's a template)
   */
  get componentContent(): Type<unknown> | null {
    const c = this.content();
    return typeof c === 'function' ? c : null;
  }
}
