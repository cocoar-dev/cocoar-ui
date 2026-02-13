import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CoarCardComponent, CoarDividerComponent } from '@cocoar/ui/components';

/**
 * Touch-First tab content for the Design Principles page.
 * Covers touch-first design principles and implementation patterns.
 */
@Component({
  selector: 'app-design-principles-touch-first-tab',
  standalone: true,
  imports: [CoarCardComponent, CoarDividerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './touch-first.tab.html',
  styleUrl: './touch-first.tab.css',
})
export class DesignPrinciplesTouchFirstTab {
  readonly touchBadExample = `// ❌ Hover-dependent — unusable on tablets
showClearButton = computed(() =>
  this.hasValue() && this.isHovered()
);`;

  readonly touchGoodExampleTS = `// ✅ Always visible when there's a value
showClearButton = computed(() =>
  this.clearable() &&
  this.internalValue() !== null &&
  !this.disabled() &&
  !this.readonly()
);`;

  readonly touchGoodExampleCSS = `.clear-button {
  opacity: 0.4; /* Dimmed by default */
  transition: opacity 0.15s ease;
}

/* Prominent when focused (works on tablets) */
.input-focused .clear-button {
  opacity: 1;
}

/* Extra feedback when hovering (desktop enhancement) */
.input-container:hover .clear-button,
.clear-button:hover {
  opacity: 1;
}`;
}
