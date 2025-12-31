import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Marks an inline submenu template for a `coar-submenu-item`.
 *
 * This is optional: if a submenu item contains exactly one direct child `<ng-template>`,
 * that template will be used even without this directive.
 */
@Directive({
  selector: 'ng-template[coarSubmenu]',
  standalone: true,
})
export class CoarSubmenuTemplateDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
