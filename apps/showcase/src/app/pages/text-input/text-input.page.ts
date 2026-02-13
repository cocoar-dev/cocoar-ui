import { Component, signal } from '@angular/core';

import {
  CoarTextInputComponent,
  CoarCodeBlockComponent,
  CoarCardComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [
    CoarTextInputComponent,
    CoarCodeBlockComponent,
    CoarCardComponent,
  ],
  templateUrl: './text-input.page.html',
  styleUrl: './text-input.page.css',
})
export class TextInputPage {
  importCode = `import { CoarTextInputComponent } from '@cocoar/ui/components';`;

  // Demo values
  basicValue = signal('');
  emailValue = signal('');
  websiteValue = signal('');
  priceValue = signal('');
  searchValue = signal('');
  bioValue = signal('');
  notesValue = signal('');

  codeExamples = {
    basic: `<coar-text-input
  label="Username"
  placeholder="Enter your username"
  hint="Choose a unique username"
  [value]="basicValue()"
  (valueChange)="basicValue.set($event)"
/>`,

    required: `<coar-text-input
  label="Email"
  placeholder="your@email.com"
  [required]="true"
  hint="Required field"
  [value]="emailValue()"
  (valueChange)="emailValue.set($event)"
/>`,

    error: `<coar-text-input
  label="Email"
  [value]="emailValue()"
  error="Please enter a valid email address"
/>`,

    disabled: `<coar-text-input label="Disabled" value="Cannot edit" [disabled]="true" />
<coar-text-input label="Readonly" value="View only" [readonly]="true" />`,

    prefixSuffix: `<coar-text-input label="Website" placeholder="example.com" prefix="https://" />
<coar-text-input label="Price" placeholder="0.00" suffix="EUR" />`,

    clear: `<coar-text-input
  label="Search"
  placeholder="Type to search..."
  [clearable]="true"
  [value]="searchValue()"
  (valueChange)="searchValue.set($event)"
  (clear)="onClear()"
/>`,

    sizes: `<!-- Available sizes: xs, sm, md, lg -->
<coar-text-input size="xs" label="Extra Small" placeholder="27px height" />
<coar-text-input size="sm" label="Small" placeholder="32px height" />
<coar-text-input size="md" label="Medium" placeholder="40px height" />
<coar-text-input size="lg" label="Large" placeholder="48px height" />`,

    multiline: `<coar-text-input
  label="Bio"
  placeholder="Tell us about yourself..."
  [rows]="4"
  hint="Max 500 characters"
  [value]="bioValue()"
  (valueChange)="bioValue.set($event)"
/>`,

    multilineRows: `<!-- 3 rows (textarea) -->
<coar-text-input label="Short Note" [rows]="3" />

<!-- 6 rows (textarea) -->
<coar-text-input label="Description" [rows]="6" />`,
  };

  onClear(): void {
    this.searchValue.set('');
  }
}
