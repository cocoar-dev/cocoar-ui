import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoarButtonComponent, CoarScrollbarDirective } from '@cocoar/ui-components';

@Component({
  imports: [RouterModule, CommonModule, CoarButtonComponent, CoarScrollbarDirective],
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
