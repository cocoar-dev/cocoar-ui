import { Component, inject, signal } from '@angular/core';
import { Router, Routes, provideRouter } from '@angular/router';
import { defineScenario } from '@cocoar/scenar-abstractions';
import { RoutedFragmentService } from './routed-fragment.service';
import {
  ComponentRoutedFragment,
  ActionRoutedFragment,
  IRoutedFragmentConfig,
  ROUTED_FRAGMENTS,
} from './routed-fragment';
import { createRouteData } from './create-route-data';
import { CommonModule } from '@angular/common';

// Modal component to be loaded dynamically
@Component({
  selector: 'demo-modal',
  standalone: true,
  template: `
    <div class="demo-modal" style="padding: 20px; border: 2px solid blue; background: white;">
      <h3>Modal Opened!</h3>
      <p>ID: {{ id }}</p>
      <p>Fragment params work! ✅</p>
    </div>
  `,
})
export class DemoModalComponent {
  id = '';
}

// Main scenario component
@Component({
  selector: 'coar-routed-fragment-scenario',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h2>Routed Fragments Demo</h2>

      <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 4px;">
        <h3>Current URL Fragment:</h3>
        <code style="background: white; padding: 5px; border-radius: 3px;">
          {{ currentFragment() || '(none)' }}
        </code>
      </div>

      <div style="margin: 20px 0;">
        <h3>Test Navigation:</h3>
        <button (click)="openModal('123')" style="margin: 5px; padding: 10px 15px;">
          Open Modal #123
        </button>
        <button (click)="openModal('456')" style="margin: 5px; padding: 10px 15px;">
          Open Modal #456
        </button>
        <button
          (click)="openModalWithParams('789')"
          style="margin: 5px; padding: 10px 15px; background: #4caf50; color: white;"
        >
          Modal #789 + Query Params
        </button>
        <button
          (click)="openMultipleFragments()"
          style="margin: 5px; padding: 10px 15px; background: purple; color: white;"
        >
          Multiple Fragments (#123 + #456)
        </button>
        <button
          (click)="openComplexFragment()"
          style="margin: 5px; padding: 10px 15px; background: teal; color: white;"
        >
          Complex: Modal + Params + Action
        </button>
        <button
          (click)="triggerAction()"
          style="margin: 5px; padding: 10px 15px; background: orange;"
        >
          Trigger Action
        </button>
        <button
          (click)="clearFragment()"
          style="margin: 5px; padding: 10px 15px; background: red; color: white;"
        >
          Clear Fragment
        </button>
      </div>

      <div style="margin: 20px 0;">
        <h3>Component Fragments (Modals):</h3>
        <div style="background: #e8f5e9; padding: 10px; border-radius: 4px;">
          @if (componentFragments().length === 0) {
            <p style="color: #666;">No component fragments active</p>
          } @else {
            @for (item of componentFragments(); track item.fragment) {
              <div
                style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #4caf50;"
              >
                <strong>Fragment:</strong> {{ item.fragment }}<br />
                <strong>Params:</strong> {{ item.params | json }}<br />
                <strong>Type:</strong> {{ item.route.type }}
              </div>
            }
          }
        </div>
      </div>

      <div style="margin: 20px 0;">
        <h3>Action Log:</h3>
        <div
          style="background: #fff3e0; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto;"
        >
          @if (actionLog().length === 0) {
            <p style="color: #666;">No actions triggered yet</p>
          } @else {
            @for (action of actionLog(); track $index) {
              <div
                style="margin: 5px 0; padding: 5px; background: white; border-left: 3px solid #ff9800;"
              >
                {{ action }}
              </div>
            }
          }
        </div>
      </div>

      <div style="margin-top: 30px; padding: 15px; background: #e3f2fd; border-radius: 4px;">
        <h3>✨ What this demonstrates:</h3>
        <ul>
          <li>✅ Fragment parsing with path parameters (<code>:id</code>)</li>
          <li>✅ Query parameters (<code>?edit=true&tab=settings&count=42</code>)</li>
          <li>✅ Multiple fragments (<code>#modal/123#modal/456</code>)</li>
          <li>✅ Component loading (modals)</li>
          <li>✅ Action handlers (side effects)</li>
          <li>✅ Multiple fragment types working together</li>
          <li>✅ Real browser URL manipulation</li>
          <li>✅ path-to-regexp v8 compatibility</li>
          <li>✅ Complex fragments: params + query params + actions combined</li>
        </ul>
      </div>
    </div>
  `,
})
export class RoutedFragmentScenarioComponent {
  private router = inject(Router);
  private fragmentService = inject(RoutedFragmentService);

  currentFragment = signal<string>('');
  componentFragments = signal<any[]>([]);
  actionLog = signal<string[]>([]);

  constructor() {
    // Set initial fragment
    const url = this.router.url;
    const initialFragment = url.split('#')[1] || '';
    this.currentFragment.set(initialFragment);

    // Monitor URL changes
    this.router.events.subscribe(() => {
      const url = this.router.url;
      const fragmentPart = url.split('#')[1] || '';
      this.currentFragment.set(fragmentPart);
    });

    // Monitor component fragments
    this.fragmentService.getParsedFragments('component').subscribe((items) => {
      this.componentFragments.set(items);
    });

    // Monitor action fragments
    this.fragmentService.getParsedFragments('action').subscribe((actions) => {
      actions.forEach((item) => {
        const route = item.route as ActionRoutedFragment;
        if (route.handler) {
          route.handler(item.params);
        }
      });
    });
  }

  openModal(id: string) {
    this.router.navigate([], { fragment: `modal/${id}` });
  }

  openModalWithParams(id: string) {
    // Demonstrate query parameters
    this.router.navigate([], { fragment: `modal/${id}?edit=true&tab=settings&count=42` });
  }

  openMultipleFragments() {
    // Demonstrate multiple fragments with #
    this.router.navigate([], { fragment: `modal/123#modal/456` });
  }

  openComplexFragment() {
    // Demonstrate complex case: modal with params + action
    this.router.navigate([], { fragment: `modal/999?edit=true&priority=high#test-action` });
  }

  triggerAction() {
    this.router.navigate([], { fragment: 'test-action' });
  }

  clearFragment() {
    this.router.navigate([], { fragment: undefined });
  }
}

// Route configuration with fragments
const fragments: (ComponentRoutedFragment | ActionRoutedFragment)[] = [
  {
    type: 'component',
    // Array path: matches any of these paths
    path: ['modal/:id', 'detail/:id'],
    loadComponent: () => Promise.resolve(DemoModalComponent),
    options: { width: '600px' },
  },
  {
    type: 'action',
    path: 'test-action',
    handler: (params: any) => {
      // Demo: Log action to console (in real app, dispatch event, update service, etc.)
      console.log('Action triggered!', params, new Date().toLocaleTimeString());
    },
  },
];

const routes: Routes = [
  {
    path: '',
    component: RoutedFragmentScenarioComponent,
    data: createRouteData<IRoutedFragmentConfig>({
      routedFragments: fragments,
    }),
  },
];

export const scenario = defineScenario<RoutedFragmentScenarioComponent>({
  id: 'routed-fragments',
  title: 'Routed Fragments (Service Integration)',
  description: 'Demonstrates fragment-based routing with component loading and actions',
  providers: [
    provideRouter(routes),
    RoutedFragmentService,
    // Provide fragments via injection token (since scenario routes don't have real route data)
    { provide: ROUTED_FRAGMENTS, useValue: fragments },
  ],
});
