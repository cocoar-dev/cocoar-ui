import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarBadgeComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarButtonComponent,
  CoarTableComponent,
  BadgeVariant,
  BadgeSize,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [
    CommonModule,
    CoarBadgeComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarButtonComponent,
    CoarTableComponent,
  ],
  templateUrl: './badges.page.html',
  styleUrl: './badges.page.css',
})
export class BadgesPage {
  activeTab = 'examples';

  /** Badge variants */
  variants: BadgeVariant[] = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];

  /** Badge sizes (excluding auto for demos) */
  sizes: BadgeSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

  /** Size labels for display */
  sizeLabels: Record<BadgeSize, string> = {
    xs: '12px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
    auto: '100%',
  };

  /** Demo notification count */
  notificationCount = signal(5);

  /** Toggle pulse animation */
  pulseEnabled = signal(true);

  /** Increment notification count */
  incrementCount(): void {
    this.notificationCount.update((n) => n + 1);
  }

  /** Reset notification count */
  resetCount(): void {
    this.notificationCount.set(0);
  }

  /** API properties */
  apiProperties = [
    {
      name: 'content',
      type: 'string | number',
      default: "''",
      description: 'The content to display (number, text, or empty for dot mode)',
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'",
      default: "'primary'",
      description: 'Visual style variant',
    },
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto'",
      default: "'md'",
      description: 'Badge size',
    },
    {
      name: 'dot',
      type: 'boolean',
      default: 'false',
      description: 'Show as a small dot without content',
    },
    {
      name: 'pulse',
      type: 'boolean',
      default: 'false',
      description: 'Add a pulsing animation for attention',
    },
    {
      name: 'max',
      type: 'number | null',
      default: 'null',
      description: 'Maximum number to display (shows "max+" when exceeded)',
    },
    {
      name: 'bordered',
      type: 'boolean',
      default: 'false',
      description: 'Add a white border around the badge',
    },
  ];

  /** Code examples */
  codeExamples = {
    variants: `<coar-badge [content]="42" variant="primary" />
<coar-badge [content]="42" variant="secondary" />
<coar-badge [content]="42" variant="success" />
<coar-badge [content]="42" variant="warning" />
<coar-badge [content]="42" variant="error" />
<coar-badge [content]="42" variant="info" />`,

    sizes: `<coar-badge [content]="7" size="xs" />  <!-- 12px -->
<coar-badge [content]="7" size="sm" />  <!-- 16px -->
<coar-badge [content]="7" size="md" />  <!-- 20px (default) -->
<coar-badge [content]="7" size="lg" />  <!-- 24px -->
<coar-badge [content]="7" size="xl" />  <!-- 32px -->`,

    text: `<coar-badge content="New" variant="success" />
<coar-badge content="Beta" variant="warning" />
<coar-badge content="Pro" variant="primary" />
<coar-badge content="Hot" variant="error" />`,

    max: `<coar-badge [content]="5" [max]="99" variant="error" />
<coar-badge [content]="99" [max]="99" variant="error" />
<coar-badge [content]="100" [max]="99" variant="error" />  <!-- Shows "99+" -->
<coar-badge [content]="999" [max]="99" variant="error" />  <!-- Shows "99+" -->`,

    dot: `<!-- Simple status dots -->
<coar-badge [dot]="true" variant="success" />
<coar-badge [dot]="true" variant="warning" />
<coar-badge [dot]="true" variant="error" />`,

    pulse: `<!-- Pulsing notification -->
<coar-badge [content]="3" variant="error" [pulse]="true" />

<!-- Pulsing status dot -->
<coar-badge [dot]="true" variant="success" [pulse]="true" />

<!-- Live indicator -->
<coar-badge content="Live" variant="error" [pulse]="true" />`,

    bordered: `<!-- Bordered badge on avatar -->
<div class="avatar-wrapper">
  <div class="avatar">👤</div>
  <coar-badge [content]="3" variant="error" size="xs" [bordered]="true" />
</div>`,

    interactive: `<coar-badge
  [content]="notificationCount()"
  [max]="99"
  variant="error"
  [pulse]="pulseEnabled()"
/>

<button (click)="incrementCount()">Add</button>
<button (click)="resetCount()">Clear</button>`,
  };
}
