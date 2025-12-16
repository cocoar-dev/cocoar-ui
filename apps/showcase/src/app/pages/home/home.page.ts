import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoarCardComponent } from '@cocoar/ui-components';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CoarCardComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePage {}
