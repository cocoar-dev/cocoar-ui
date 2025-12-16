import { Component, OnInit, OnDestroy, input } from '@angular/core';

/**
 * A demo component that logs when it gets initialized and destroyed.
 * Used to demonstrate lazy loading behavior in tabs.
 */
@Component({
  selector: 'app-lazy-demo',
  standalone: true,
  template: `
    <div class="lazy-demo">
      <div class="lazy-demo-header">
        <span class="lazy-demo-icon">{{ icon() }}</span>
        <h4 class="coar-subheading">{{ title() }}</h4>
      </div>
      <p class="coar-body-small lazy-demo-text">
        This component was initialized at: <strong>{{ initTime }}</strong>
      </p>
      <p class="coar-body-small lazy-demo-hint">
        Check the console to see when this component is created and destroyed.
      </p>
    </div>
  `,
  styles: [
    `
      .lazy-demo {
        padding: 1rem;
        background: var(--coar-background-neutral-secondary);
        border-radius: var(--coar-radius-xs);
        border-left: 4px solid var(--coar-border-accent-primary);
      }
      .lazy-demo-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .lazy-demo-icon {
        font-size: 1.5rem;
      }
      .lazy-demo-text {
        margin-bottom: 0.5rem;
      }
      .lazy-demo-hint {
        color: var(--coar-text-neutral-tertiary);
        font-style: italic;
      }
    `,
  ],
})
export class LazyDemoComponent implements OnInit, OnDestroy {
  title = input<string>('Lazy Loaded Component');
  icon = input<string>('⚡');

  initTime = '';

  ngOnInit(): void {
    this.initTime = new Date().toLocaleTimeString();
    // Using console.warn for demo purposes (to show in browser console)
    console.warn(`[LazyDemoComponent] "${this.title()}" initialized at ${this.initTime}`);
  }

  ngOnDestroy(): void {
    console.warn(`[LazyDemoComponent] "${this.title()}" destroyed`);
  }
}
