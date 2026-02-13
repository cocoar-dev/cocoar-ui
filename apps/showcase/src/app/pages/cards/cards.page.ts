import { Component } from '@angular/core';

import {
  CoarCodeBlockComponent,
  CoarCardComponent,
  CoarButtonComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-cards-page',
  standalone: true,
  imports: [CoarCodeBlockComponent, CoarCardComponent, CoarButtonComponent],
  templateUrl: './cards.page.html',
  styleUrl: './cards.page.css',
})
export class CardsPage {
  importCode = `import { CoarCardComponent } from '@cocoar/ui/components';`;

  // Code examples
  basicExample = `<coar-card>
  <h3>Card Title</h3>
  <p>This is a basic card with default settings.</p>
</coar-card>`;

  variantsExample = `<!-- Default (with border) -->
<coar-card>
  <h3>Default Card</h3>
  <p>Has border by default.</p>
</coar-card>

<!-- Borderless (no border) -->
<coar-card borderless>
  <h3>Borderless Card</h3>
  <p>Background only, no border.</p>
</coar-card>

<!-- Elevated (box-shadow) -->
<coar-card elevated>
  <h3>Elevated Card</h3>
  <p>Raised with box-shadow.</p>
</coar-card>

<!-- Elevated + Borderless -->
<coar-card elevated borderless>
  <h3>Elevated + Borderless</h3>
  <p>Box-shadow but no border.</p>
</coar-card>`;

  paddingExample = `<coar-card padding="none">No padding</coar-card>
<coar-card padding="s">Small padding</coar-card>
<coar-card padding="m">Medium padding (default)</coar-card>
<coar-card padding="l">Large padding</coar-card>`;

  sectionsExample = `<coar-card>
  <div coar-card-header>
    <h3>Card Header</h3>
    <p>Subtitle or meta information</p>
  </div>

  <p>Main content area for the card body.</p>

  <div coar-card-footer>
    <button>Action</button>
  </div>
</coar-card>`;

  insetExample = `<coar-card color="outlined">
  <h3>Component Example</h3>
  <p>Content goes here...</p>
</coar-card>`;

  insetUsageExample = `<coar-card color="outlined">
  <h3>Component Example</h3>
  <p>Content goes here...</p>
  <coar-code-block coar-card-footer coar-card-inset borderless
    [code]="myCode"
    language="html"
    [collapsed]="true"
  />
</coar-card>`;

  colorsExample = `<!-- Neutral (default) -->
<coar-card color="neutral">
  Default card style
</coar-card>

<!-- Success -->
<coar-card color="success">
  Operation completed!
</coar-card>

<!-- Warning -->
<coar-card color="warning">
  Please review before proceeding
</coar-card>

<!-- Error -->
<coar-card color="error">
  Something went wrong
</coar-card>

<!-- Info -->
<coar-card color="info">
  Helpful information
</coar-card>`;

  colorsElevatedExample = `<!-- Semantic colors with elevation -->
<coar-card elevated color="success">
  Success elevated
</coar-card>

<coar-card elevated color="warning">
  Warning elevated
</coar-card>

<coar-card elevated color="error">
  Error elevated
</coar-card>`;

  comboExample = `<!-- Default with success color (has border) -->
<coar-card color="success">
  Success with border (default)
</coar-card>

<!-- Borderless with success color (no border) -->
<coar-card borderless color="success">
  Success without border
</coar-card>

<!-- Elevated with info color -->
<coar-card elevated color="info">
  Info with elevation
</coar-card>

<!-- Elevated + Borderless + warning -->
<coar-card elevated borderless color="warning">
  Elevated, no border, warning
</coar-card>`;

  compositionExample = `<coar-card elevated padding="l">
  <div coar-card-header>
    <div class="avatar">👤</div>
    <div class="user-info">
      <h4>John Doe</h4>
      <span>Product Designer</span>
    </div>
  </div>

  <p>
    Building beautiful interfaces and
    creating delightful user experiences.
  </p>

  <div coar-card-footer>
    <button class="btn-primary">Follow</button>
    <button class="btn-secondary">Message</button>
  </div>
</coar-card>`;
}
