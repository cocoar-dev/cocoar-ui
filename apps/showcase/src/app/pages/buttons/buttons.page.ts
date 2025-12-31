import { Component, signal } from '@angular/core';

import {
  CoarButtonComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarNoteComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [
    CoarButtonComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent
],
  templateUrl: './buttons.page.html',
  styleUrl: './buttons.page.css',
})
export class ButtonsPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/components/buttons/overview.md';
  protected readonly apiPath = '/docs/components/buttons/api.md';

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
