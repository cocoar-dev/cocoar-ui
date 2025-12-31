import { Component } from '@angular/core';

import { CoarCardComponent, CoarDividerComponent } from '@cocoar/ui-components';

@Component({
  selector: 'app-typography',
  standalone: true,
  imports: [CoarCardComponent, CoarDividerComponent],
  templateUrl: './typography.page.html',
  styleUrl: './typography.page.css',
})
export class TypographyPage {}
