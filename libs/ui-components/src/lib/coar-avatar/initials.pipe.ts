import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe that extracts initials from a name string.
 *
 * Takes the first character of each word and concatenates them.
 * Useful with CoarAvatarComponent to display initials instead of raw text.
 *
 * @example
 * ```html
 * <!-- Single name: "A" -->
 * {{ 'Alice' | coarInitials }}
 *
 * <!-- Two names: "AJ" -->
 * {{ 'Alice Johnson' | coarInitials }}
 *
 * <!-- Three names: "AJD" -->
 * {{ 'Alice Jane Doe' | coarInitials }}
 *
 * <!-- With avatar -->
 * <coar-avatar [name]="'Alice Johnson' | coarInitials" />
 * ```
 */
@Pipe({
  name: 'coarInitials',
  standalone: true,
})
export class CoarInitialsPipe implements PipeTransform {
  /**
   * Extract initials from a name.
   * @param value - The name string to extract initials from
   * @param maxLength - Maximum number of initials to return (default: 3)
   * @returns Uppercase initials string
   */
  transform(value: string | null | undefined, maxLength = 3): string {
    if (!value) return '';

    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';

    const initials = parts
      .map((part) => part[0])
      .slice(0, maxLength)
      .join('');

    return initials.toUpperCase();
  }
}
