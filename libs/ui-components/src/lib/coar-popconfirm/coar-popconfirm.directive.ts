import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, filter } from 'rxjs';

import { createOverlayBuilder, type OverlayRef } from '@cocoar/ui-overlay';
import { CoarButtonComponent } from '../coar-button/coar-button.component';

export type PopconfirmPlacement = 'top' | 'bottom' | 'left' | 'right';

/**
 * Popconfirm directive for confirming actions with a small anchored popover.
 *
 * Intercepts clicks on the host element, shows a confirmation popover,
 * and either proceeds with the action (confirm) or cancels.
 *
 * @example
 * ```html
 * <button coarPopconfirm="Delete this user?" (onConfirm)="deleteUser()">
 *   Delete
 * </button>
 *
 * <button
 *   [coarPopconfirm]="'Revoke all sessions?'"
 *   popconfirmTitle="Warning"
 *   confirmText="Revoke"
 *   confirmVariant="danger"
 *   (onConfirm)="revokeSessions()"
 * >
 *   Revoke
 * </button>
 * ```
 */
@Directive({
  selector: '[coarPopconfirm]',
  standalone: true,
})
export class CoarPopconfirmDirective {
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly overlayBuilder = createOverlayBuilder();

  private overlayRef: OverlayRef | null = null;

  /** Confirmation message to display */
  coarPopconfirm = input.required<string>();

  /** Optional title above the message */
  popconfirmTitle = input<string>('');

  /** Text for the confirm button */
  confirmText = input<string>('OK');

  /** Text for the cancel button */
  cancelText = input<string>('Cancel');

  /** Variant for confirm button */
  confirmVariant = input<'primary' | 'danger'>('primary');

  /** Placement relative to trigger element */
  placement = input<PopconfirmPlacement>('top');

  /** Whether popconfirm is disabled */
  popconfirmDisabled = input<boolean>(false);

  /** Emitted when user confirms */
  confirmed = output<void>();

  /** Emitted when user cancels */
  cancelled = output<void>();

  /** Whether the popconfirm is currently open */
  protected readonly isOpen = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.close();
    });

    // Close on escape
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(() => this.isOpen()),
        filter((event) => event.key === 'Escape')
      )
      .subscribe(() => {
        this.cancel();
      });
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.popconfirmDisabled()) return;

    event.preventDefault();
    event.stopPropagation();

    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    if (this.overlayRef) return;

    const trigger = this.elementRef.nativeElement;

    this.overlayRef = this.overlayBuilder
      .anchor({ kind: 'element', element: trigger })
      .position(this.getPlacementConfig())
      .backdrop({ kind: 'none' })
      .dismiss({ outsideClick: true, escapeKey: true })
      .a11y({ role: 'dialog' })
      .fromComponent(CoarPopconfirmPanelComponent)
      .open({
        message: this.coarPopconfirm(),
        title: this.popconfirmTitle(),
        confirmText: this.confirmText(),
        cancelText: this.cancelText(),
        confirmVariant: this.confirmVariant(),
        placement: this.placement(),
        onConfirm: () => this.confirm(),
        onCancel: () => this.cancel(),
      });

    this.isOpen.set(true);
  }

  private close(): void {
    this.overlayRef?.close();
    this.overlayRef = null;
    this.isOpen.set(false);
  }

  private confirm(): void {
    this.confirmed.emit();
    this.close();
  }

  private cancel(): void {
    this.cancelled.emit();
    this.close();
  }

  private getPlacementConfig() {
    const placement = this.placement();
    const placementMap: Record<PopconfirmPlacement, ('top' | 'bottom' | 'left' | 'right')[]> = {
      top: ['top', 'bottom', 'left', 'right'],
      bottom: ['bottom', 'top', 'left', 'right'],
      left: ['left', 'right', 'top', 'bottom'],
      right: ['right', 'left', 'top', 'bottom'],
    };
    return { placement: placementMap[placement], offset: 8 };
  }
}

/**
 * Internal panel component for popconfirm content.
 */
@Component({
  selector: 'coar-popconfirm-panel',
  standalone: true,
  imports: [CoarButtonComponent],
  host: {
    '[attr.data-placement]': 'placement()',
  },
  template: `
    <div class="coar-popconfirm-panel">
      @if (title()) {
        <div class="coar-popconfirm-panel__title">{{ title() }}</div>
      }
      <div class="coar-popconfirm-panel__message">{{ message() }}</div>
      <div class="coar-popconfirm-panel__actions">
        <coar-button size="sm" variant="secondary" (clicked)="onCancel()?.()">
          {{ cancelText() }}
        </coar-button>
        <coar-button
          size="sm"
          [variant]="confirmVariant() === 'danger' ? 'danger' : 'primary'"
          (clicked)="onConfirm()?.()"
        >
          {{ confirmText() }}
        </coar-button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        position: relative;
        display: block;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
      }

      .coar-popconfirm-panel {
        position: relative;
        padding: 0.75rem;
        background: var(--coar-background-neutral-primary);
        border: 1px solid var(--coar-border-neutral-tertiary);
        border-radius: var(--coar-radius-sm);
        max-width: 280px;
        font-family: var(--coar-body-base-family);
      }

      /* Arrow pseudo-element */
      .coar-popconfirm-panel::before {
        content: '';
        position: absolute;
        width: 10px;
        height: 10px;
        background: var(--coar-background-neutral-primary);
        border: 1px solid var(--coar-border-neutral-tertiary);
        transform: rotate(45deg);
      }

      /* Top placement - arrow at bottom pointing down */
      :host([data-placement='top']) .coar-popconfirm-panel::before {
        bottom: -6px;
        left: 50%;
        margin-left: -5px;
        border-top: none;
        border-left: none;
      }

      /* Bottom placement - arrow at top pointing up */
      :host([data-placement='bottom']) .coar-popconfirm-panel::before {
        top: -6px;
        left: 50%;
        margin-left: -5px;
        border-bottom: none;
        border-right: none;
      }

      /* Left placement - arrow at right pointing right */
      :host([data-placement='left']) .coar-popconfirm-panel::before {
        right: -6px;
        top: 50%;
        margin-top: -5px;
        border-bottom: none;
        border-left: none;
      }

      /* Right placement - arrow at left pointing left */
      :host([data-placement='right']) .coar-popconfirm-panel::before {
        left: -6px;
        top: 50%;
        margin-top: -5px;
        border-top: none;
        border-right: none;
      }

      .coar-popconfirm-panel__title {
        font-weight: 600;
        font-size: var(--coar-body-base-size);
        color: var(--coar-text-neutral-primary);
        margin-bottom: 0.25rem;
      }

      .coar-popconfirm-panel__message {
        font-size: var(--coar-body-small-size);
        color: var(--coar-text-neutral-secondary);
        margin-bottom: 0.75rem;
        line-height: 1.4;
      }

      .coar-popconfirm-panel__actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarPopconfirmPanelComponent {
  /** Confirmation message to display */
  message = input<string>('');

  /** Optional title above the message */
  title = input<string>('');

  /** Text for the confirm button */
  confirmText = input<string>('OK');

  /** Text for the cancel button */
  cancelText = input<string>('Cancel');

  /** Variant for confirm button */
  confirmVariant = input<'primary' | 'danger'>('primary');

  /** Placement for arrow positioning */
  placement = input<PopconfirmPlacement>('top');

  /** Callback when user confirms */
  onConfirm = input<(() => void) | undefined>(undefined);

  /** Callback when user cancels */
  onCancel = input<(() => void) | undefined>(undefined);
}
