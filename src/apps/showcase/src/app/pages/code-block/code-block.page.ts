import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarCodeBlockComponent,
  CoarTableComponent,
  CoarDividerComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [
    CommonModule,
    CoarCodeBlockComponent,
    CoarTableComponent,
    CoarDividerComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
  ],
  templateUrl: './code-block.page.html',
  styleUrl: './code-block.page.css',
})
export class CodeBlockPage {
  activeTab = 'examples';

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
import { CoarButtonComponent } from '@aspect/ui-components';

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
  "name": "@cocoar/ui-components",
  "version": "1.0.0",
  "dependencies": {
    "@angular/core": "^20.0.0",
    "@cocoar/ui-tokens": "^1.0.0"
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

  usageCode = `<coar-code-block
  [code]="myCode"
  language="typescript"
  title="Example"
  [collapsible]="true"
  [showCopy]="true"
  theme="dark"
/>`;

  apiProperties = [
    {
      name: 'code',
      type: 'string',
      required: true,
      default: '-',
      description: 'The code string to display',
    },
    {
      name: 'language',
      type: 'string',
      required: false,
      default: "'html'",
      description: 'Language hint shown in header',
    },
    {
      name: 'title',
      type: 'string',
      required: false,
      default: "''",
      description: 'Title for the code block (replaces language label)',
    },
    {
      name: 'collapsible',
      type: 'boolean',
      required: false,
      default: 'true',
      description: 'Whether the block can be collapsed',
    },
    {
      name: 'collapsed',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Initial collapsed state',
    },
    {
      name: 'showCopy',
      type: 'boolean',
      required: false,
      default: 'true',
      description: 'Show copy-to-clipboard button',
    },
    {
      name: 'showLineNumbers',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Display line numbers',
    },
    {
      name: 'maxHeight',
      type: 'number',
      required: false,
      default: '0',
      description: 'Max height in px (0 = no limit)',
    },
    {
      name: 'theme',
      type: "'dark' | 'light'",
      required: false,
      default: "'dark'",
      description: 'Color theme override',
    },
  ];
}
