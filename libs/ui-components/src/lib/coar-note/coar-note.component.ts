import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NoteColor = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'accent';
export type NotePadding = 'sm' | 'md' | 'lg';

/**
 * A callout/note component for highlighting information.
 *
 * Features a colored left border and subtle background.
 * Use for tips, warnings, important information, or behavioral notes.
 *
 * @example
 * ```html
 * <coar-note color="info">
 *   <strong>Note:</strong> This is important information.
 * </coar-note>
 *
 * <coar-note color="warning" padding="lg">
 *   <h4>Warning</h4>
 *   <p>Be careful with this action.</p>
 * </coar-note>
 * ```
 */
@Component({
  selector: 'coar-note',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coar-note.component.html',
  styleUrls: ['./coar-note.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.coar-note]': 'true',
    // Colors
    '[class.coar-note--neutral]': 'color() === "neutral"',
    '[class.coar-note--success]': 'color() === "success"',
    '[class.coar-note--warning]': 'color() === "warning"',
    '[class.coar-note--error]': 'color() === "error"',
    '[class.coar-note--info]': 'color() === "info"',
    '[class.coar-note--accent]': 'color() === "accent"',
    // Padding
    '[class.coar-note--padding-sm]': 'padding() === "sm"',
    '[class.coar-note--padding-md]': 'padding() === "md"',
    '[class.coar-note--padding-lg]': 'padding() === "lg"',
  },
})
export class CoarNoteComponent {
  /**
   * Note color scheme.
   * Determines the left border color and background tint.
   * @default 'info'
   */
  color = input<NoteColor>('neutral');

  /**
   * Note padding size.
   * @default 'md'
   */
  padding = input<NotePadding>('md');
}
