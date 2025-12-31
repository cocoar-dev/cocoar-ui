import { Component } from '@angular/core';

import { CoarCodeBlockComponent, CoarDividerComponent } from '@cocoar/ui-components';

@Component({
  selector: 'app-motion',
  standalone: true,
  imports: [CoarCodeBlockComponent, CoarDividerComponent],
  templateUrl: './motion.page.html',
  styleUrl: './motion.page.css',
})
export class MotionPage {
  // Code examples for the Usage section
  codeExamples = {
    basicTransition: `.my-button {
  /* Use pre-composed transition */
  transition: var(--coar-transition-default);
}

.my-button:hover {
  background-color: var(--coar-color-primary-600);
}`,

    customTransition: `.dropdown {
  /* Combine duration and easing tokens */
  transition: opacity var(--coar-duration-slow) var(--coar-ease-out),
              transform var(--coar-duration-slow) var(--coar-ease-out);
}`,

    animation: `.fade-in {
  animation: fadeIn var(--coar-duration-normal) var(--coar-ease-out);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`,

    hoverState: `.icon-button {
  /* Fast transition for micro-interactions */
  transition: var(--coar-transition-fast);
}

.icon-button:hover {
  transform: scale(1.1);
}`,

    reducedMotion: `@media (prefers-reduced-motion: reduce) {
  --coar-duration-*: 0ms;
}`,
  };

  // Duration tokens
  durationTokens = [
    {
      name: 'Instant',
      variable: '--coar-duration-instant',
      value: '0ms',
      description: 'No animation',
    },
    {
      name: 'Fast',
      variable: '--coar-duration-fast',
      value: '100ms',
      description: 'Hover, focus states',
    },
    {
      name: 'Normal',
      variable: '--coar-duration-normal',
      value: '200ms',
      description: 'Buttons, inputs',
    },
    {
      name: 'Slow',
      variable: '--coar-duration-slow',
      value: '300ms',
      description: 'Dropdowns, panels',
    },
    {
      name: 'Slower',
      variable: '--coar-duration-slower',
      value: '400ms',
      description: 'Modals, overlays',
    },
    {
      name: 'Slowest',
      variable: '--coar-duration-slowest',
      value: '500ms',
      description: 'Complex animations',
    },
  ];

  // Easing tokens
  easingTokens = [
    { name: 'Linear', variable: '--coar-ease-linear', description: 'Constant speed' },
    { name: 'Ease Out', variable: '--coar-ease-out', description: 'Entering elements (fast→slow)' },
    { name: 'Ease In', variable: '--coar-ease-in', description: 'Exiting elements (slow→fast)' },
    { name: 'Ease In-Out', variable: '--coar-ease-in-out', description: 'Moving elements' },
    { name: 'Bounce', variable: '--coar-ease-bounce', description: 'Playful overshoot' },
  ];

  // Pre-composed transitions
  transitionTokens = [
    {
      name: 'Default',
      variable: '--coar-transition-default',
      description: 'Most interactive elements',
    },
    { name: 'Fast', variable: '--coar-transition-fast', description: 'Hover/focus states' },
    { name: 'Colors', variable: '--coar-transition-colors', description: 'Color changes only' },
    { name: 'Transform', variable: '--coar-transition-transform', description: 'Scale, translate' },
    { name: 'Opacity', variable: '--coar-transition-opacity', description: 'Fade in/out' },
    { name: 'Shadow', variable: '--coar-transition-shadow', description: 'Elevation changes' },
  ];
}
