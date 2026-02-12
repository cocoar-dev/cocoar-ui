import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  CoarIconComponent,
  CoarIconService,
  CoarCodeBlockComponent,
  CoarCardComponent,
  CoarTextInputComponent,
} from '@cocoar/ui-components';

type IconsPageSourceGroup = Readonly<{
  key: string;
  icons: readonly string[];
}>;

@Component({
  selector: 'app-icons',
  standalone: true,
  imports: [
    CoarIconComponent,
    CoarCodeBlockComponent,
    CoarCardComponent,
    CoarTextInputComponent,
  ],
  templateUrl: './icons.page.html',
  styleUrl: './icons.page.css',
})
export class IconsPage {
  importCode = `import { CoarIconComponent } from '@cocoar/ui-components';`;

  private readonly iconService = inject(CoarIconService);

  /** All available icon names grouped by icon source */
  private readonly iconGroups = signal<readonly IconsPageSourceGroup[]>([]);

  /** Search filter for icons */
  searchQuery = signal('');

  /** Total icon count across all sources */
  get totalIconsCount(): number {
    return this.iconGroups().reduce((count, group) => count + group.icons.length, 0);
  }

  /** Filtered icons grouped by source */
  get filteredIconGroups(): readonly IconsPageSourceGroup[] {
    const groups = this.iconGroups();
    const query = this.searchQuery().toLowerCase();
    if (!query) return groups;

    return groups
      .map((group) => ({
        key: group.key,
        icons: group.icons.filter((icon) => icon.toLowerCase().includes(query)),
      }))
      .filter((group) => group.icons.length > 0);
  }

  /** Available sizes */
  sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = ['xs', 'sm', 'md', 'lg', 'xl'];

  /** Size labels for display */
  sizeLabels: Record<string, string> = {
    xs: '12px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
    auto: 'fills parent',
  };

  /** Currently selected icon for demo */
  selectedIcon = signal('settings');

  /** Code examples */
  codeExamples = {
    basic: `<coar-icon name="settings" />
<coar-icon name="user" />
<coar-icon name="check" />`,

    sizes: `<coar-icon name="settings" size="xs" />  <!-- 12px -->
<coar-icon name="settings" size="sm" />  <!-- 16px -->
<coar-icon name="settings" size="md" />  <!-- 20px (default) -->
<coar-icon name="settings" size="lg" />  <!-- 24px -->
<coar-icon name="settings" size="xl" />  <!-- 32px -->

<!-- Custom size -->
<coar-icon name="settings" size="48px" />`,

    colors: `<!-- Named colors -->
<coar-icon name="check" color="green" />
<coar-icon name="close" color="red" />

<!-- Hex colors -->
<coar-icon name="important" color="#ff6600" />

<!-- CSS variables -->
<coar-icon name="settings" color="var(--coar-text-accent-primary)" />

<!-- Inherit from parent -->
<coar-icon name="user" color="inherit" />`,

    rotation: `<!-- Static rotation -->
<coar-icon name="caret-right" [rotate]="0" />
<coar-icon name="caret-right" [rotate]="90" />
<coar-icon name="caret-right" [rotate]="180" />
<coar-icon name="caret-right" [rotate]="270" />

<!-- Animated rotation -->
<coar-icon
  name="caret-right"
  [rotate]="isExpanded ? 90 : 0"
  [rotateTransition]="200"
/>`,

    spin: `<!-- Loading spinner -->
<coar-icon name="load" [spin]="true" />

<!-- Conditional spin -->
<coar-icon name="load" [spin]="isLoading" />`,

    withLabel: `<coar-icon name="settings" label="Settings" />
<coar-icon name="user" label="Profile" />`,
  };

  /** Copy icon name to clipboard */
  copyIconName(name: string): void {
    navigator.clipboard.writeText(name);
  }

  constructor() {
    void this.loadIconGroups();
  }

  private async loadIconGroups(): Promise<void> {
    const sources = this.iconService.getRegisteredSources().filter((s) => s.canProvideIconKeys);
    const groups: IconsPageSourceGroup[] = [];

    for (const source of sources) {
      const keys = await firstValueFrom(this.iconService.getAvailableIconKeys(source.key));
      groups.push({ key: source.key, icons: keys });
    }

    this.iconGroups.set(groups);
  }
}
