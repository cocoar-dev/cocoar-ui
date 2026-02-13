import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';

import {
  CoarButtonComponent,
  CoarScrollbarDirective,
  CoarSidebarComponent,
  CoarSingleSelectComponent,
} from '@cocoar/ui/components';
import { CoarMenuComponent, CoarMenuItemComponent, CoarMenuHeadingComponent } from '@cocoar/ui/menu';
import { CoarLocalizationService } from '@cocoar/localization';

@Component({
  imports: [
    RouterModule,
    CoarButtonComponent,
    CoarScrollbarDirective,
    CoarSidebarComponent,
    CoarSingleSelectComponent,
    CoarMenuComponent,
    CoarMenuItemComponent,
    CoarMenuHeadingComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly localization = inject(CoarLocalizationService);

  isDarkMode = false;

  readonly languages = [
    { value: 'en', label: '🇬🇧 English' },
    { value: 'de', label: '🇩🇪 Deutsch' },
  ];

  currentLanguage = toSignal(this.localization.languageState.value$, {
    initialValue: this.localization.languageState.value,
  });

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark-mode', this.isDarkMode);
  }

  switchLanguage(lang: string | null): void {
    if (!lang) return;
    this.localization.setLanguage(lang);
  }
}
