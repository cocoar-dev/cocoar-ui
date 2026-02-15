import { ChangeDetectionStrategy, Component, input } from '@angular/core';


export type NoteVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'accent';
export type NotePadding = 's' | 'm' | 'l';

/**
 * A callout/note component for highlighting information.
 *
 * Features a colored left border and subtle background.
 * Use for tips, warnings, important information, or behavioral notes.
 *
 * @example
 * ```html
 * <coar-note variant="info">
 *   <strong>Note:</strong> This is important information.
 * </coar-note>
 *
 * <coar-note variant="warning" padding="l">
 *   <h4>Warning</h4>
 *   <p>Be careful with this action.</p>
 * </coar-note>
 * ```
 */
@Component({
  selector: 'coar-note',
  standalone: true,
  imports: [],
  templateUrl: './coar-note.component.html',
  styleUrls: ['./coar-note.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.coar-note]': 'true',
    // Variants
    '[class.coar-note--neutral]': 'variant() === "neutral"',
    '[class.coar-note--success]': 'variant() === "success"',
    '[class.coar-note--warning]': 'variant() === "warning"',
    '[class.coar-note--error]': 'variant() === "error"',
    '[class.coar-note--info]': 'variant() === "info"',
    '[class.coar-note--accent]': 'variant() === "accent"',
    // Padding
    '[class.coar-note--padding-s]': 'padding() === "s"',
    '[class.coar-note--padding-m]': 'padding() === "m"',
    '[class.coar-note--padding-l]': 'padding() === "l"',
  },
})
export class CoarNoteComponent {
  /**
   * Note semantic variant.
   * Determines the left border color and background tint.
   * @default 'neutral'
   */
  variant = input<NoteVariant>('neutral');

  /**
   * Note padding size.
   * @default 'm'
   */
  padding = input<NotePadding>('m');
}
