import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  CoarButtonComponent,
  CoarScrollbarDirective,
  CoarSidebarComponent,
} from '@cocoar/ui-components';
import {
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarMenuHeadingComponent,
} from '@cocoar/ui-menu';

@Component({
  imports: [
    RouterModule,
    CoarButtonComponent,
    CoarScrollbarDirective,
    CoarSidebarComponent,
    CoarMenuComponent,
    CoarMenuItemComponent,
    CoarMenuHeadingComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  isDarkMode = false;

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark-mode', this.isDarkMode);
  }
}
