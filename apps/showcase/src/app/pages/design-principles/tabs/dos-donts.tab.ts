import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CoarCardComponent } from '@cocoar/ui/components';

/**
 * Do's & Don'ts tab content for the Design Principles page.
 * Covers best practices, anti-patterns, layout stability, and margin-free components.
 */
@Component({
  selector: 'app-design-principles-dos-donts-tab',
  standalone: true,
  imports: [CoarCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dos-donts.tab.html',
  styleUrl: './dos-donts.tab.css',
})
export class DesignPrinciplesDosDontsTab {
  readonly inspirations = [
    { name: 'Ant Design', note: 'Enterprise-focused, balanced density' },
    { name: 'Carbon (IBM)', note: 'Professional, accessible' },
    { name: 'Atlassian', note: 'Productivity tools' },
    { name: 'Primer (GitHub)', note: 'Developer-focused' },
  ];

  readonly antiPatterns = [
    { name: 'Material Design', note: 'Too playful' },
    { name: 'Bootstrap', note: 'Too rounded' },
    { name: 'Tailwind UI', note: 'Too marketing-focused' },
  ];

  readonly clsBadExample = `<!-- Content shifts when error appears -->
<coar-text-input label="Email" />
@if (hasError) {
  <span class="error">Invalid email</span>
}
<coar-password-input label="Password" />`;

  readonly clsGoodExample = `<!-- Space reserved for error message -->
<coar-text-input label="Email" />
<div class="error-slot" style="min-height: 20px;">
  @if (hasError) {
    <span class="error">Invalid email</span>
  }
</div>
<coar-password-input label="Password" />`;

  readonly marginBadExample = `/* ❌ Components with built-in margins */
coar-text-input {
  margin-bottom: 16px;
}

/* Problem: Last item has unwanted margin,
   hard to customize per context */`;

  readonly marginGoodExample = `<!-- ✅ Parent controls spacing with gap -->
<div class="form-fields">
  <coar-text-input label="Name" />
  <coar-text-input label="Email" />
  <coar-button>Submit</coar-button>
</div>

<style>
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;  /* Parent owns the spacing */
}
</style>`;
}
