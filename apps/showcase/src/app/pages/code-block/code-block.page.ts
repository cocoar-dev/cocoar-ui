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

  // Example code snippets demonstrating code-block usage
  basicExample = `<coar-code-block
  [code]="myCode"
  language="typescript"
/>`;

  cssExample = `/* Styling with design tokens */
coar-code-block {
  margin-bottom: var(--coar-spacing-l);
  border-radius: var(--coar-radius-m);
}`;

  tsExample = `import { Component } from '@angular/core';
import { CoarCodeBlockComponent } from '@cocoar/ui/components';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CoarCodeBlockComponent],
  template: \`
    <coar-code-block
      [code]="snippetCode"
      language="typescript"
      [collapsible]="true"
      [collapsed]="true"
    />
  \`
})
export class ExampleComponent {
  snippetCode = \`console.log('Hello, World!');\`;
}`;

  jsonExample = `{
  "code": "const value = 42;",
  "language": "typescript",
  "title": "example.ts",
  "showLineNumbers": true,
  "collapsible": true,
  "collapsed": false,
  "maxHeight": 400
}`;

  longExample = `// Full configuration example with all available properties
<coar-code-block
  [code]="longSnippet"
  language="typescript"
  title="api.service.ts"
  [showLineNumbers]="true"
  [showCopy]="true"
  [collapsible]="true"
  [collapsed]="false"
  [maxHeight]="300"
/>

// Component code
export class MyComponent {
  longSnippet = \`
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get('/api/data');
  }
}
  \`.trim();
}`;
}
