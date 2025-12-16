import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoarDividerComponent } from '@cocoar/ui-components';

interface SizeToken {
  name: string;
  variable: string;
  value: string;
}

@Component({
  selector: 'app-spacing',
  standalone: true,
  imports: [CommonModule, CoarDividerComponent],
  templateUrl: './spacing.page.html',
  styleUrl: './spacing.page.css',
})
export class SpacingPage {
  // Border Radius tokens (sorted by size)
  radiusTokens: SizeToken[] = [
    { name: 'XXS', variable: '--coar-radius-xxs', value: '2px' },
    { name: 'XS', variable: '--coar-radius-xs', value: '4px' },
    { name: 'S', variable: '--coar-radius-s', value: '6px' },
    { name: 'M', variable: '--coar-radius-m', value: '8px' },
    { name: 'L', variable: '--coar-radius-l', value: '12px' },
    { name: 'XL', variable: '--coar-radius-xl', value: '16px' },
    { name: 'Full', variable: '--coar-radius-full', value: '999px' },
  ];

  // Stroke Width tokens (sorted by size)
  strokeTokens: SizeToken[] = [
    { name: 'XS', variable: '--coar-stroke-width-xs', value: '0.5px' },
    { name: 'S', variable: '--coar-stroke-width-s', value: '1px' },
    { name: 'M', variable: '--coar-stroke-width-m', value: '2px' },
    { name: 'L', variable: '--coar-stroke-width-l', value: '4px' },
  ];

  // Spacing tokens (4px grid system)
  spacingTokens: SizeToken[] = [
    { name: 'XXS', variable: '--coar-spacing-xxs', value: '2px' },
    { name: 'XS', variable: '--coar-spacing-xs', value: '4px' },
    { name: 'S', variable: '--coar-spacing-s', value: '8px' },
    { name: 'M', variable: '--coar-spacing-m', value: '16px' },
    { name: 'L', variable: '--coar-spacing-l', value: '24px' },
    { name: 'XL', variable: '--coar-spacing-xl', value: '32px' },
    { name: 'XXL', variable: '--coar-spacing-xxl', value: '48px' },
    { name: 'XXXL', variable: '--coar-spacing-xxxl', value: '64px' },
  ];

  // Shadow/Elevation tokens
  shadowTokens = [
    { name: 'XS', variable: '--coar-shadow-xs', description: 'Subtle lift for hover states' },
    { name: 'S', variable: '--coar-shadow-s', description: 'Cards and raised elements' },
    { name: 'M', variable: '--coar-shadow-m', description: 'Dropdowns and popovers' },
    { name: 'L', variable: '--coar-shadow-l', description: 'Modals and dialogs' },
    { name: 'XL', variable: '--coar-shadow-xl', description: 'Elevated overlays' },
    { name: 'Focus', variable: '--coar-shadow-focus', description: 'Focus ring for accessibility' },
  ];
}
