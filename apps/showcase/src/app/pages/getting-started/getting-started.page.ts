import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoarCardComponent, CoarCodeBlockComponent } from '@cocoar/ui/components';

@Component({
  selector: 'app-getting-started',
  standalone: true,
  imports: [RouterModule, CoarCardComponent, CoarCodeBlockComponent],
  templateUrl: './getting-started.page.html',
  styleUrl: './getting-started.page.css',
})
export class GettingStartedPage {
  installCode = `pnpm add @cocoar/ui`;

  installExtraCode = `pnpm add @cocoar/data-grid        # AG Grid wrapper
pnpm add @cocoar/markdown-viewer  # Markdown rendering
pnpm add @cocoar/localization     # i18n & language management`;

  importTokensCode = `/* styles.css */
@import '@cocoar/ui/styles/all.css';`;

  componentImportsCode = `// Core components (buttons, cards, inputs, ...)
import { CoarButtonComponent } from '@cocoar/ui/components';

// Menu components
import { CoarMenuComponent } from '@cocoar/ui/menu';

// Overlay components (tooltip, popover, ...)
import { CoarTooltipDirective } from '@cocoar/ui/overlay';`;

  darkModeCode = `<!-- Add the .dark-mode class to the root element -->
<html class="dark-mode">
  ...
</html>

<!-- Or toggle it programmatically -->
<script>
  document.documentElement.classList.toggle('dark-mode');
</script>`;

  tokensCode = `.my-component {
  color: var(--coar-text-neutral-primary);
  background: var(--coar-background-neutral-secondary);
  padding: var(--coar-spacing-m);
  border-radius: var(--coar-radius-m);
  border: 1px solid var(--coar-border-neutral-secondary);
}`;
}
