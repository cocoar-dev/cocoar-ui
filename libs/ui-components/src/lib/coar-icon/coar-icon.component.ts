import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
  effect,
  booleanAttribute,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CoarIconService } from './coar-icon.service';

export type CoarIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto';

/**
 * COAR Icon Component
 *
 * Icon component supporting DI-provided icon registries.
 *
 * Usage:
 * ```html
 * <coar-icon name="settings" size="md"></coar-icon>
 * ```
 *
 * Size tokens:
 * - xs = 12px
 * - sm = 16px
 * - md = 20px (default)
 * - lg = 24px
 * - xl = 32px
 * - auto = fills parent container (use padding on parent to control)
 */
@Component({
  selector: 'coar-icon',
  standalone: true,
  imports: [],
  template: `
    @if (name()) {
      @if (sanitizedSvg(); as svg) {
        <div
          class="coar-icon"
          [class]="isPresetSize(size()) ? 'coar-icon--' + size() : ''"
          [class.coar-icon--spin]="spin()"
          [style.transform]="'rotate(' + rotate() + 'deg)'"
          [style.color]="color()"
          [style.width]="!isPresetSize(size()) ? size() : null"
          [style.height]="!isPresetSize(size()) ? size() : null"
          [style.transition]="getRotateTransitionValue()"
          [innerHTML]="svg"
        ></div>
      } @else if (isLoading()) {
        <div
          class="coar-icon coar-icon--loading"
          [class]="isPresetSize(size()) ? 'coar-icon--' + size() : ''"
          [style.width]="!isPresetSize(size()) ? size() : null"
          [style.height]="!isPresetSize(size()) ? size() : null"
        ></div>
      }
    }
    @if (label()) {
      <span class="coar-icon__label">{{ label() }}</span>
    } @else {
      <span class="coar-icon__label">
        <ng-content></ng-content>
      </span>
    }
  `,
  styleUrl: './coar-icon.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.icon-name]': 'name()',
  },
})
export class CoarIconComponent {
  private readonly iconService = inject(CoarIconService);
  private readonly sanitizer = inject(DomSanitizer);

  private iconLoadVersion = 0;

  /**
   * Icon identifier.
   * Examples: "settings", "user"
   */
  name = input<string>();

  /**
   * Optional icon source key.
   *
   * - If omitted, the default source is used.
   * - If multiple sources are registered, this can be used to target a specific one.
   */
  source = input<string | undefined>();

  /**
   * Icon size. Defaults to 'md' (20px).
   * Can be a preset token (xs, sm, md, lg, xl, auto) or a custom CSS value (e.g., '42px', '3rem').
   */
  size = input<CoarIconSize | string>('md');

  /**
   * Rotation angle in degrees (0, 90, 180, 270, or any number).
   */
  rotate = input<number>(0);

  /**
   * Rotation transition animation.
   * - Empty/undefined: No animation
   * - Number: Duration in milliseconds (e.g., 300)
   * - String: Full CSS transition value (e.g., '0.3s ease-in-out', '500ms cubic-bezier(0.4, 0, 0.2, 1)')
   */
  rotateTransition = input<number | string>();

  /**
   * Enable continuous spinning animation.
   */
  spin = input<boolean, unknown>(false, { transform: booleanAttribute });

  /**
   * Icon color. Can be any valid CSS color value.
   * Examples: 'red', '#ff0000', 'rgb(255, 0, 0)', 'var(--coar-text-semantic-error-bold)'
   * Use 'inherit' to inherit the parent element's color.
   */
  color = input<string>('inherit');

  /**
   * Optional text label to display next to the icon.
   */
  label = input<string | number>();

  /**
   * Signal holding the sanitized SVG HTML ready for rendering.
   */
  protected sanitizedSvg = signal<SafeHtml | null>(null);

  /**
   * Signal indicating whether an icon is currently being loaded.
   */
  protected isLoading = signal(false);

  /**
   * Check if the size is a preset token (xs, sm, md, lg, xl, auto).
   */
  protected isPresetSize(size: string): boolean {
    return ['xs', 'sm', 'md', 'lg', 'xl', 'auto'].includes(size);
  }

  /**
   * Compute the CSS transition value for rotation.
   */
  protected getRotateTransitionValue(): string | null {
    const transition = this.rotateTransition();
    if (!transition) return null;

    if (typeof transition === 'number') {
      return `transform ${transition}ms ease-in-out`;
    }

    if (!transition.includes('transform')) {
      return `transform ${transition}`;
    }

    return transition;
  }

  constructor() {
    effect(() => {
      const iconName = this.name();
      const sourceKey = this.source();
      if (!iconName) {
        this.iconLoadVersion++;
        this.sanitizedSvg.set(null);
        this.isLoading.set(false);
        return;
      }

      const loadVersion = ++this.iconLoadVersion;

      // Clear any previously rendered SVG so the template can show the loading placeholder.
      this.sanitizedSvg.set(null);
      this.isLoading.set(true);

      const subscription = this.resolveIcon$(iconName, sourceKey)
        .pipe(
          finalize(() => {
            if (loadVersion === this.iconLoadVersion) {
              this.isLoading.set(false);
            }
          })
        )
        .subscribe((svg) => {
          if (loadVersion !== this.iconLoadVersion) {
            return;
          }

          if (!svg) {
            this.sanitizedSvg.set(null);
            return;
          }

          this.sanitizedSvg.set(this.sanitizer.bypassSecurityTrustHtml(svg));
        });

      // Important: cancel in-flight icon loads if `name` changes or the component is destroyed.
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Resolve an icon name to an SVG string.
   *
   * This is kept as a single observable chain so callers can cancel it.
   */
  private resolveIcon$(name: string, sourceKey: string | undefined): Observable<string | null> {
    return this.iconService.getIcon(name, sourceKey).pipe(catchError(() => of(null)));
  }
}
