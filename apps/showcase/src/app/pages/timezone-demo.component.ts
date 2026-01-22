import { Component, inject } from '@angular/core';
import { CoarTimeZoneService } from '@cocoar/localization';

/**
 * Demo component showing timezone resolution.
 */
@Component({
  selector: 'app-timezone-demo',
  standalone: true,
  template: `
    <div class="timezone-demo">
      <h2>Timezone Demo</h2>

      <div class="info-card">
        <h3>Current Timezone</h3>
        <p class="timezone-value">{{ currentTimeZone() }}</p>
        <p class="timezone-hint">Detected from browser's Intl API</p>
      </div>

      <div class="info-card">
        <h3>Current Time</h3>
        <p class="time-value">{{ currentTime }}</p>
        <p class="timezone-hint">In {{ currentTimeZone() }}</p>
      </div>

      <div class="info-section">
        <h3>About Timezone Resolution</h3>
        <ul>
          <li><strong>Browser Provider:</strong> Always present (guaranteed baseline)</li>
          <li><strong>Custom Providers:</strong> None registered (add via config)</li>
          <li><strong>Resolution:</strong> Custom → Browser → UTC safety net</li>
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
      .timezone-demo {
        padding: 2rem;
        max-width: 800px;
      }

      .info-card {
        background: var(--coar-color-surface, #f5f5f5);
        border: 1px solid var(--coar-color-border, #e0e0e0);
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .info-card h3 {
        margin-top: 0;
        color: var(--coar-color-text-primary, #333);
      }

      .timezone-value {
        font-size: 2rem;
        font-weight: 600;
        color: var(--coar-color-primary, #2563eb);
        margin: 0.5rem 0;
        font-family: 'Courier New', monospace;
      }

      .time-value {
        font-size: 1.5rem;
        font-weight: 500;
        color: var(--coar-color-text-primary, #333);
        margin: 0.5rem 0;
      }

      .timezone-hint {
        font-size: 0.875rem;
        color: var(--coar-color-text-secondary, #666);
        margin: 0;
      }

      .info-section {
        background: var(--coar-color-info-light, #e3f2fd);
        border: 1px solid var(--coar-color-info, #2196f3);
        border-radius: 8px;
        padding: 1.5rem;
      }

      .info-section h3 {
        margin-top: 0;
        color: var(--coar-color-info-dark, #1565c0);
      }

      .info-section ul {
        margin: 0.5rem 0 0 0;
        padding-left: 1.5rem;
      }

      .info-section li {
        margin: 0.5rem 0;
        color: var(--coar-color-text-primary, #333);
      }
    `,
  ],
})
export class TimezoneDemoComponent {
  private timeZoneService = inject(CoarTimeZoneService);

  // Signal (reactive, updates automatically)
  currentTimeZone = this.timeZoneService.currentTimeZone;

  // Current time formatted in the current timezone
  get currentTime(): string {
    try {
      const timeZone = this.currentTimeZone();
      const now = new Date();

      return new Intl.DateTimeFormat('en-US', {
        timeZone,
        dateStyle: 'full',
        timeStyle: 'long',
      }).format(now);
    } catch {
      return 'Unable to format time';
    }
  }
}
