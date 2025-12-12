import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarIconComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarTextInputComponent,
  CoarTableComponent,
  CoarDividerComponent,
  CORE_ICONS,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-icons',
  standalone: true,
  imports: [
    CommonModule,
    CoarIconComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarTextInputComponent,
    CoarTableComponent,
    CoarDividerComponent,
  ],
  templateUrl: './icons.page.html',
  styleUrl: './icons.page.css',
})
export class IconsPage {
  activeTab = 'examples';

  /** All available icon names */
  allIcons = Object.keys(CORE_ICONS).sort();

  /** Search filter for icons */
  searchQuery = signal('');

  /** Filtered icons based on search */
  get filteredIcons(): string[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.allIcons;
    return this.allIcons.filter((icon) => icon.toLowerCase().includes(query));
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

  /** API properties */
  apiProperties = [
    {
      name: 'name',
      type: 'CoreIconName',
      default: 'undefined',
      description: 'Icon identifier from the built-in registry or custom namespace',
    },
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto' | string",
      default: "'md'",
      description: 'Size token or custom CSS value (e.g., "42px", "3rem")',
    },
    {
      name: 'color',
      type: 'string',
      default: "'inherit'",
      description: 'Any valid CSS color value or CSS variable',
    },
    {
      name: 'rotate',
      type: 'number',
      default: '0',
      description: 'Rotation angle in degrees',
    },
    {
      name: 'rotateTransition',
      type: 'number | string',
      default: 'undefined',
      description: 'Transition for rotation animation (ms or CSS value)',
    },
    {
      name: 'spin',
      type: 'boolean',
      default: 'false',
      description: 'Enable continuous spinning animation',
    },
    {
      name: 'label',
      type: 'string | number',
      default: 'undefined',
      description: 'Optional text label displayed next to the icon',
    },
    {
      name: 'fallback',
      type: 'string',
      default: 'undefined',
      description: 'Fallback icon if the requested icon fails to load',
    },
  ];

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
}
