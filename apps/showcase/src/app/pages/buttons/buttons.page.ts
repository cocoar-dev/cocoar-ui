import { Component, signal } from '@angular/core';

import {
  CoarButtonComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarNoteComponent,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [
    CoarButtonComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarNoteComponent,
  ],
  templateUrl: './buttons.page.html',
  styleUrl: './buttons.page.css',
})
export class ButtonsPage {
  importCode = `import { CoarButtonComponent } from '@cocoar/ui-components';`;

  // Loading demos
  isLoading = signal(false);
  isLoadingEnd = signal(false);
  isLoadingNoIcon = signal(false);

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
