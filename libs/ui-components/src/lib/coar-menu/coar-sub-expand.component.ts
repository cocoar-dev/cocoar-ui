import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  input,
  model,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import { type CoreIconName } from '../coar-icon/core-icons';
import { CoarSubmenuTemplateDirective } from './coar-submenu-template.directive';

/**
 * CoarSubExpand: Menu item that expands/collapses a submenu inline.
 *
 * Use this variant when you want nested options to stay visible (e.g. sidebar panels)
 * while still reusing the same menu item types inside the submenu.
 *
 * @example
 * ```html
 * <coar-menu>
 *   <coar-sub-expand label="Filters" icon="settings" [(open)]="filtersOpen">
 *     <ng-template>
 *       <coar-menu>
 *         <coar-menu-item icon="plus">Add Filter</coar-menu-item>
 *         <coar-menu-item icon="trash">Clear</coar-menu-item>
 *       </coar-menu>
 *     </ng-template>
   </coar-sub-expand>
 * </coar-menu>
 * ```
 */
@Component({
  selector: 'coar-sub-expand',
  standalone: true,
  imports: [CommonModule, CoarIconComponent],
  template: `
    <div
      class="coar-sub-expand"
      [class.coar-sub-expand--disabled]="disabled()"
      [class.coar-sub-expand--open]="open()"
      [attr.role]="'menuitem'"
      [attr.aria-haspopup]="'menu'"
      [attr.aria-expanded]="open()"
      [attr.aria-disabled]="disabled()"
      [attr.tabindex]="disabled() ? -1 : 0"
      (click)="toggle($event)"
      (keydown.enter)="toggle($event)"
      (keydown.space)="toggle($event)"
    >
      <span class="coar-sub-expand__icon" aria-hidden="true">
        @if (icon()) {
        <coar-icon [name]="icon()!" size="sm" aria-hidden="true" />
        }
      </span>
      <span class="coar-sub-expand__label">{{ label() }}</span>
      <coar-icon
        [name]="open() ? 'minus' : 'plus'"
        size="xs"
        class="coar-sub-expand__arrow"
        aria-hidden="true"
      />
    </div>

    <div
      class="coar-sub-expand__panel"
      [class.coar-sub-expand__panel--open]="open()"
      [attr.aria-hidden]="open() ? null : 'true'"
      role="group"
    >
      <div class="coar-sub-expand__panel-inner">
        <ng-container *ngTemplateOutlet="submenuTemplateToRender()" />
      </div>
    </div>
  `,
  styleUrl: './coar-sub-expand.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarSubExpandComponent {
  /** Label text for the menu item */
  readonly label = input.required<string>();

  /** Optional icon identifier */
  readonly icon = input<CoreIconName | undefined>(undefined);

  /** Disabled state prevents interaction */
  readonly disabled = input(false);

  /** Expanded state (two-way bindable with [(open)]) */
  readonly open = model(false);

  /** Emits when expanded state changes (for [(open)]) */
  readonly openChange = output<boolean>();

  /** Optional external submenu template. Prefer an inline `<ng-template>` child when possible. */
  readonly submenuTemplate = input<TemplateRef<unknown> | null>(null);

  @ContentChild(CoarSubmenuTemplateDirective, { descendants: false })
  private readonly markedInlineTemplate?: CoarSubmenuTemplateDirective;

  @ContentChild(TemplateRef, { descendants: false })
  private readonly inlineTemplate?: TemplateRef<unknown>;

  protected submenuTemplateToRender(): TemplateRef<unknown> {
    const template =
      this.markedInlineTemplate?.templateRef ?? this.inlineTemplate ?? this.submenuTemplate();

    if (!template) {
      throw new Error(
        'CoarSubExpandComponent: missing submenu content. Provide either an inline <ng-template> child or set [submenuTemplate].'
      );
    }

    return template;
  }

  toggle(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const next = !this.open();
    this.open.set(next);
    this.openChange.emit(next);
  }
}
