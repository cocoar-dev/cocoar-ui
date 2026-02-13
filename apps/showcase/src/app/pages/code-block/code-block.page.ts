import { Component } from '@angular/core';

import {
  CoarCodeBlockComponent,
  CoarCardComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [CoarCodeBlockComponent, CoarCardComponent],
  templateUrl: './code-block.page.html',
  styleUrl: './code-block.page.css',
})
export class CodeBlockPage {
  importCode = `import { CoarCodeBlockComponent } from '@cocoar/ui/components';`;

  // Example code snippets
  basicExample = `<coar-button variant="primary">
  Click me
</coar-button>`;

  cssExample = `.coar-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--coar-spacing-s) var(--coar-spacing-m);
  border-radius: var(--coar-radius-m);
  transition: var(--coar-transition-default);
}`;

  tsExample = `import { Component } from '@angular/core';
import { CoarButtonComponent } from '@cocoar/ui/components';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CoarButtonComponent],
  template: \`
    <coar-button
      variant="primary"
      (click)="handleClick()">
      Submit
    </coar-button>
  \`
})
export class ExampleComponent {
  handleClick() {
    console.log('Button clicked!');
  }
}`;

  jsonExample = `{
  "name": "@cocoar/ui",
  "version": "1.0.0",
  "dependencies": {
    "@angular/core": "^21.0.0",
    "@cocoar/ui": "^0.1.0"
  }
}`;

  longExample = `// A longer code example to demonstrate scrolling
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, retry } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'https://api.example.com';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(\`\${this.baseUrl}/users\`).pipe(
      retry(3),
      map(users => users.filter(u => u.active)),
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(\`\${this.baseUrl}/users/\${id}\`).pipe(
      catchError(this.handleError)
    );
  }

  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(\`\${this.baseUrl}/users\`, user).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    throw error;
  }
}`;
}
