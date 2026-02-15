import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarNavbarComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-navbar-page',
  standalone: true,
  imports: [
    CommonModule,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarNavbarComponent,
  ],
  templateUrl: './navbar.page.html',
  styleUrl: './navbar.page.css',
})
export class NavbarPage {
  importCode = `import { CoarNavbarComponent } from '@cocoar/ui/components';`;

  basicExample = `<coar-navbar>
  <div coar-navbar-start>
    <strong>MyApp</strong>
  </div>
  <nav coar-navbar-center>
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </nav>
  <div coar-navbar-end>
    <button>Login</button>
  </div>
</coar-navbar>`;

  borderedExample = `<coar-navbar [elevated]="false" bordered>
  <div coar-navbar-start>
    <strong>MyApp</strong>
  </div>
  <nav coar-navbar-center>
    <a href="#">Dashboard</a>
    <a href="#">Reports</a>
  </nav>
  <div coar-navbar-end>
    <span>Admin</span>
  </div>
</coar-navbar>`;

  flatExample = `<coar-navbar [elevated]="false">
  <div coar-navbar-start>
    <strong>Flat Navbar</strong>
  </div>
  <div coar-navbar-end>
    <a href="#">Help</a>
  </div>
</coar-navbar>`;
}
