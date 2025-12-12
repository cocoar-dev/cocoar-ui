import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoarCardComponent, CoarDividerComponent, CoarTagComponent } from '@cocoar/ui-components';

interface ColorSwatch {
  name: string;
  variable: string;
  shades?: { shade: string; variable: string }[];
}

interface SemanticColor {
  category: string;
  colors: { name: string; variable: string; description: string }[];
}

@Component({
  selector: 'app-colors',
  standalone: true,
  imports: [CommonModule, CoarCardComponent, CoarDividerComponent, CoarTagComponent],
  templateUrl: './colors.page.html',
  styleUrl: './colors.page.css',
})
export class ColorsPage {
  // Color primitives
  primitives: ColorSwatch[] = [
    {
      name: 'Gray',
      variable: '--coar-color-gray',
      shades: [
        { shade: '50', variable: '--coar-color-gray-50' },
        { shade: '100', variable: '--coar-color-gray-100' },
        { shade: '200', variable: '--coar-color-gray-200' },
        { shade: '300', variable: '--coar-color-gray-300' },
        { shade: '400', variable: '--coar-color-gray-400' },
        { shade: '500', variable: '--coar-color-gray-500' },
        { shade: '600', variable: '--coar-color-gray-600' },
        { shade: '700', variable: '--coar-color-gray-700' },
        { shade: '800', variable: '--coar-color-gray-800' },
        { shade: '900', variable: '--coar-color-gray-900' },
      ],
    },
    {
      name: 'Slate (Brand)',
      variable: '--coar-color-slate',
      shades: [
        { shade: '50', variable: '--coar-color-slate-50' },
        { shade: '100', variable: '--coar-color-slate-100' },
        { shade: '200', variable: '--coar-color-slate-200' },
        { shade: '300', variable: '--coar-color-slate-300' },
        { shade: '400', variable: '--coar-color-slate-400' },
        { shade: '500', variable: '--coar-color-slate-500' },
        { shade: '600', variable: '--coar-color-slate-600' },
        { shade: '700', variable: '--coar-color-slate-700' },
        { shade: '800', variable: '--coar-color-slate-800' },
        { shade: '900', variable: '--coar-color-slate-900' },
      ],
    },
    {
      name: 'Accent (Themeable)',
      variable: '--coar-color-accent',
      shades: [
        { shade: '50', variable: '--coar-color-accent-50' },
        { shade: '100', variable: '--coar-color-accent-100' },
        { shade: '200', variable: '--coar-color-accent-200' },
        { shade: '300', variable: '--coar-color-accent-300' },
        { shade: '400', variable: '--coar-color-accent-400' },
        { shade: '500', variable: '--coar-color-accent-500' },
        { shade: '600', variable: '--coar-color-accent-600' },
        { shade: '700', variable: '--coar-color-accent-700' },
        { shade: '800', variable: '--coar-color-accent-800' },
        { shade: '900', variable: '--coar-color-accent-900' },
      ],
    },
    {
      name: 'Green',
      variable: '--coar-color-green',
      shades: [
        { shade: '50', variable: '--coar-color-green-50' },
        { shade: '100', variable: '--coar-color-green-100' },
        { shade: '200', variable: '--coar-color-green-200' },
        { shade: '300', variable: '--coar-color-green-300' },
        { shade: '400', variable: '--coar-color-green-400' },
        { shade: '500', variable: '--coar-color-green-500' },
        { shade: '600', variable: '--coar-color-green-600' },
        { shade: '700', variable: '--coar-color-green-700' },
        { shade: '800', variable: '--coar-color-green-800' },
        { shade: '900', variable: '--coar-color-green-900' },
      ],
    },
    {
      name: 'Red',
      variable: '--coar-color-red',
      shades: [
        { shade: '50', variable: '--coar-color-red-50' },
        { shade: '100', variable: '--coar-color-red-100' },
        { shade: '200', variable: '--coar-color-red-200' },
        { shade: '300', variable: '--coar-color-red-300' },
        { shade: '400', variable: '--coar-color-red-400' },
        { shade: '500', variable: '--coar-color-red-500' },
        { shade: '600', variable: '--coar-color-red-600' },
        { shade: '700', variable: '--coar-color-red-700' },
        { shade: '800', variable: '--coar-color-red-800' },
        { shade: '900', variable: '--coar-color-red-900' },
      ],
    },
    {
      name: 'Amber',
      variable: '--coar-color-amber',
      shades: [
        { shade: '50', variable: '--coar-color-amber-50' },
        { shade: '100', variable: '--coar-color-amber-100' },
        { shade: '200', variable: '--coar-color-amber-200' },
        { shade: '300', variable: '--coar-color-amber-300' },
        { shade: '400', variable: '--coar-color-amber-400' },
        { shade: '500', variable: '--coar-color-amber-500' },
        { shade: '600', variable: '--coar-color-amber-600' },
        { shade: '700', variable: '--coar-color-amber-700' },
        { shade: '800', variable: '--coar-color-amber-800' },
        { shade: '900', variable: '--coar-color-amber-900' },
      ],
    },
  ];

  // Semantic colors grouped by usage
  semanticColors: SemanticColor[] = [
    {
      category: 'Background - Accent',
      colors: [
        {
          name: 'Accent Primary',
          variable: '--coar-background-accent-primary',
          description: 'Primary action backgrounds (buttons, links)',
        },
        {
          name: 'Accent Secondary',
          variable: '--coar-background-accent-secondary',
          description: 'Active/selected state backgrounds',
        },
        {
          name: 'Accent Tertiary',
          variable: '--coar-background-accent-tertiary',
          description: 'Subtle accent backgrounds',
        },
        {
          name: 'Accent Hover',
          variable: '--coar-background-accent-hover',
          description: 'Hover state for accent elements',
        },
        {
          name: 'Accent Active',
          variable: '--coar-background-accent-active',
          description: 'Active/pressed state',
        },
      ],
    },
    {
      category: 'Background - Brand',
      colors: [
        {
          name: 'Brand Primary',
          variable: '--coar-background-brand-primary',
          description: 'Primary brand backgrounds (logo, identity)',
        },
        {
          name: 'Brand Secondary',
          variable: '--coar-background-brand-secondary',
          description: 'Secondary brand backgrounds',
        },
        {
          name: 'Brand Tertiary',
          variable: '--coar-background-brand-tertiary',
          description: 'Subtle brand backgrounds',
        },
      ],
    },
    {
      category: 'Background - Neutral',
      colors: [
        {
          name: 'Neutral Primary',
          variable: '--coar-background-neutral-primary',
          description: 'Main page background',
        },
        {
          name: 'Neutral Secondary',
          variable: '--coar-background-neutral-secondary',
          description: 'Cards, sections',
        },
        {
          name: 'Neutral Tertiary',
          variable: '--coar-background-neutral-tertiary',
          description: 'Hover states',
        },
      ],
    },
    {
      category: 'Text - Accent',
      colors: [
        {
          name: 'Accent Primary',
          variable: '--coar-text-accent-primary',
          description: 'Links, interactive text',
        },
        {
          name: 'Accent Secondary',
          variable: '--coar-text-accent-secondary',
          description: 'Secondary accent text',
        },
      ],
    },
    {
      category: 'Text - Neutral',
      colors: [
        {
          name: 'Neutral Primary',
          variable: '--coar-text-neutral-primary',
          description: 'Main body text',
        },
        {
          name: 'Neutral Secondary',
          variable: '--coar-text-neutral-secondary',
          description: 'Secondary text',
        },
        {
          name: 'Neutral Tertiary',
          variable: '--coar-text-neutral-tertiary',
          description: 'Muted text',
        },
        {
          name: 'Neutral Disabled',
          variable: '--coar-text-neutral-disabled',
          description: 'Disabled text',
        },
      ],
    },
    {
      category: 'Text - Brand',
      colors: [
        {
          name: 'Brand Primary',
          variable: '--coar-text-brand-primary',
          description: 'Brand identity text (logo, etc.)',
        },
      ],
    },
    {
      category: 'Border - Accent',
      colors: [
        {
          name: 'Accent Primary',
          variable: '--coar-border-accent-primary',
          description: 'Interactive element borders',
        },
        {
          name: 'Accent Secondary',
          variable: '--coar-border-accent-secondary',
          description: 'Secondary accent borders',
        },
      ],
    },
    {
      category: 'Border - Neutral',
      colors: [
        {
          name: 'Neutral Primary',
          variable: '--coar-border-neutral-primary',
          description: 'Strong borders',
        },
        {
          name: 'Neutral Secondary',
          variable: '--coar-border-neutral-secondary',
          description: 'Default borders',
        },
      ],
    },
    {
      category: 'Border - Brand',
      colors: [
        {
          name: 'Brand Primary',
          variable: '--coar-border-brand-primary',
          description: 'Brand identity borders',
        },
      ],
    },
    {
      category: 'Semantic - Status',
      colors: [
        {
          name: 'Success Bold',
          variable: '--coar-background-semantic-success-bold',
          description: 'Success backgrounds',
        },
        {
          name: 'Success Subtle',
          variable: '--coar-background-semantic-success-subtle',
          description: 'Subtle success',
        },
        {
          name: 'Error Bold',
          variable: '--coar-background-semantic-error-bold',
          description: 'Error backgrounds',
        },
        {
          name: 'Error Subtle',
          variable: '--coar-background-semantic-error-subtle',
          description: 'Subtle error',
        },
        {
          name: 'Warning Bold',
          variable: '--coar-background-semantic-warning-bold',
          description: 'Warning backgrounds',
        },
        {
          name: 'Warning Subtle',
          variable: '--coar-background-semantic-warning-subtle',
          description: 'Subtle warning',
        },
        {
          name: 'Info Bold',
          variable: '--coar-background-semantic-info-bold',
          description: 'Info backgrounds',
        },
        {
          name: 'Info Subtle',
          variable: '--coar-background-semantic-info-subtle',
          description: 'Subtle info',
        },
      ],
    },
  ];
}
