import { Component } from '@angular/core';

import { CoarCardComponent } from '@cocoar/ui/components';

@Component({
  selector: 'app-typography',
  standalone: true,
  imports: [CoarCardComponent],
  templateUrl: './typography.page.html',
  styleUrl: './typography.page.css',
})
export class TypographyPage {}
