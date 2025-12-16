import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarCodeBlockComponent,
  CoarCardComponent,
  CoarButtonComponent,
  CoarTagComponent,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-cards-page',
  standalone: true,
  imports: [
    CommonModule,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarCodeBlockComponent,
    CoarCardComponent,
    CoarButtonComponent,
    CoarTagComponent,
  ],
  templateUrl: './cards.page.html',
  styleUrl: './cards.page.css',
})
export class CardsPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  protected readonly docsPath = '/docs/components/cards/overview.md';
  protected readonly apiPath = '/docs/components/cards/api.md';

  // Page-level tabs
  activeTab = 'examples';

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
<coar-card padding="sm">Small padding</coar-card>
<coar-card padding="md">Medium padding (default)</coar-card>
<coar-card padding="lg">Large padding</coar-card>`;

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

  compositionExample = `<coar-card elevated padding="lg">
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
