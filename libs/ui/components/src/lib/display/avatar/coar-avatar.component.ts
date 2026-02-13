import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  booleanAttribute,
} from '@angular/core';

export type AvatarSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
export type AvatarShape = 'circle' | 'square';

/**
 * Avatar component for displaying user profile images with fallback to initials.
 *
 * @example
 * ```html
 * <!-- With image -->
 * <coar-avatar [src]="user.avatarUrl" [name]="user.fullName" />
 *
 * <!-- Initials fallback (no image) -->
 * <coar-avatar [name]="user.fullName" />
 *
 * <!-- With status indicator -->
 * <coar-avatar [name]="user.fullName">
 *   <coar-badge dot variant="success" />
 * </coar-avatar>
 * ```
 */
@Component({
  selector: 'coar-avatar',
  standalone: true,
  imports: [],
  templateUrl: './coar-avatar.component.html',
  styleUrl: './coar-avatar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.coar-avatar--xs]': 'size() === "xs"',
    '[class.coar-avatar--s]': 'size() === "s"',
    '[class.coar-avatar--m]': 'size() === "m"',
    '[class.coar-avatar--l]': 'size() === "l"',
    '[class.coar-avatar--xl]': 'size() === "xl"',
    '[class.coar-avatar--xxl]': 'size() === "xxl"',
    '[class.coar-avatar--square]': 'shape() === "square"',
    '[class.coar-avatar--clickable]': 'clickable()',
    '[attr.role]': 'clickable() ? "button" : null',
    '[attr.tabindex]': 'clickable() ? 0 : null',
  },
})
export class CoarAvatarComponent {
  /** Image URL for the avatar */
  src = input<string>('');

  /** User's full name (used for initials fallback and alt text) */
  name = input<string>('');

  /** Avatar size */
  size = input<AvatarSize>('m');

  /** Avatar shape */
  shape = input<AvatarShape>('circle');

  /** Whether the avatar is interactive (clickable) */
  clickable = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Custom initials override (otherwise computed from name) */
  initials = input<string>('');

  /** Background color for initials (auto-generated from name if not set) */
  bgColor = input<string>('');

  /** Whether the image failed to load */
  protected imageError = signal(false);

  /** Show initials when no image or image failed */
  protected showInitials = computed(() => {
    return !this.src() || this.imageError();
  });

  /** Computed initials from name (max 3 characters) */
  protected displayInitials = computed(() => {
    const customInitials = this.initials();
    if (customInitials) return customInitials.slice(0, 3).toUpperCase();

    const name = this.name().trim();
    if (!name) return '?';

    // Simply take first 3 characters
    return name.slice(0, 3).toUpperCase();
  });

  /** Generate consistent background color from name */
  protected computedBgColor = computed(() => {
    const customBg = this.bgColor();
    if (customBg) return customBg;

    const name = this.name();
    if (!name) return 'var(--coar-background-neutral-tertiary)';

    // Generate a consistent hue from the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 45%, 65%)`;
  });

  /** Handle image load error */
  protected onImageError(): void {
    this.imageError.set(true);
  }

  /** Handle image load success */
  protected onImageLoad(): void {
    this.imageError.set(false);
  }
}
