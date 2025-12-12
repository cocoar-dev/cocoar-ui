import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarButtonComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarNoteComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarTableComponent,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [
    CommonModule,
    CoarButtonComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarTableComponent,
  ],
  templateUrl: './buttons.page.html',
  styleUrl: './buttons.page.css',
})
export class ButtonsPage {
  activeTab = 'examples';

  // Loading demos - multiple scenarios
  isLoading = signal(false);
  isLoadingEnd = signal(false);
  isLoadingNoIcon = signal(false);
  isLoadingBoth = signal(false);
  isLoadingXs = signal(false);
  isLoadingSm = signal(false);
  isLoadingMd = signal(false);
  isLoadingLg = signal(false);

  simulateLoading() {
    this.isLoading.set(true);
    setTimeout(() => this.isLoading.set(false), 2000);
  }

  simulateLoadingEnd() {
    this.isLoadingEnd.set(true);
    setTimeout(() => this.isLoadingEnd.set(false), 2000);
  }

  simulateLoadingNoIcon() {
    this.isLoadingNoIcon.set(true);
    setTimeout(() => this.isLoadingNoIcon.set(false), 2000);
  }

  simulateLoadingBoth() {
    this.isLoadingBoth.set(true);
    setTimeout(() => this.isLoadingBoth.set(false), 2000);
  }

  simulateLoadingXs() {
    this.isLoadingXs.set(true);
    setTimeout(() => this.isLoadingXs.set(false), 2000);
  }

  simulateLoadingSm() {
    this.isLoadingSm.set(true);
    setTimeout(() => this.isLoadingSm.set(false), 2000);
  }

  simulateLoadingMd() {
    this.isLoadingMd.set(true);
    setTimeout(() => this.isLoadingMd.set(false), 2000);
  }

  simulateLoadingLg() {
    this.isLoadingLg.set(true);
    setTimeout(() => this.isLoadingLg.set(false), 2000);
  }

  // Click counter demo
  clickCount = signal(0);

  // API properties
  apiProperties = [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'",
      default: "'primary'",
      description: 'Visual style variant',
    },
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Button size: xs (27px), sm (32px), md (40px), lg (48px)',
    },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button' },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Shows loading spinner and disables interaction',
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      default: "'button'",
      description: 'HTML button type attribute',
    },
    {
      name: 'iconStart',
      type: 'CoreIconName',
      default: 'undefined',
      description: 'Icon displayed before the label',
    },
    {
      name: 'iconEnd',
      type: 'CoreIconName',
      default: 'undefined',
      description: 'Icon displayed after the label',
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'false',
      description: 'Makes button take full container width',
    },
  ];

  apiOutputs = [
    {
      name: 'clicked',
      type: 'MouseEvent',
      description: 'Emitted when clicked (not emitted when disabled or loading)',
    },
  ];

  // Code examples
  codeExamples = {
    variants: `<coar-button variant="primary">Primary</coar-button>
<coar-button variant="secondary">Secondary</coar-button>
<coar-button variant="tertiary">Tertiary</coar-button>
<coar-button variant="danger">Danger</coar-button>
<coar-button variant="ghost">Ghost</coar-button>`,

    sizes: `<coar-button size="xs">Extra Small</coar-button>
<coar-button size="sm">Small</coar-button>
<coar-button size="md">Medium</coar-button>
<coar-button size="lg">Large</coar-button>`,

    icons: `<coar-button iconStart="add">Add Item</coar-button>
<coar-button iconEnd="caret-right">Next</coar-button>
<coar-button iconStart="clipboard" iconEnd="check">Download</coar-button>
<coar-button variant="danger" iconStart="bin">Delete</coar-button>`,

    loading: `<!-- With icon: spinner replaces icon, text stays visible -->
<coar-button iconStart="check" [loading]="isLoading()" (clicked)="save()">
  Save Changes
</coar-button>

<!-- Without icon: centered spinner, text hidden -->
<coar-button [loading]="isLoading()" (clicked)="submit()">
  Submit
</coar-button>`,

    disabled: `<coar-button [disabled]="true">Disabled Primary</coar-button>
<coar-button variant="secondary" [disabled]="true">Disabled Secondary</coar-button>`,

    fullWidth: `<coar-button [fullWidth]="true">Full Width Button</coar-button>`,

    events: `<coar-button (clicked)="handleClick($event)">
  Click me
</coar-button>`,
  };
}
