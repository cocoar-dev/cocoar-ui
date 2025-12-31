import { Component } from '@angular/core';

import {
  CoarNoteComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
} from '@cocoar/ui-components';
import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    CoarNoteComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarTabGroupComponent,
    CoarTabComponent
],
  templateUrl: './notes.page.html',
  styleUrl: './notes.page.css',
})
export class NotesPage {
  activeTab = 'examples';

  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  protected readonly docsPath = '/docs/components/note/overview.md';
  protected readonly apiPath = '/docs/components/note/api.md';

  /** Code examples */
  codeExamples = {
    colors: `<!-- Neutral (default) -->
<coar-note color="neutral">
  <strong>Note:</strong> General information for the user.
</coar-note>

<!-- Info -->
<coar-note color="info">
  <strong>Tip:</strong> Here's a helpful tip to improve your workflow.
</coar-note>

<!-- Success -->
<coar-note color="success">
  <strong>Success:</strong> Your changes have been saved successfully.
</coar-note>

<!-- Warning -->
<coar-note color="warning">
  <strong>Warning:</strong> This action cannot be undone.
</coar-note>

<!-- Error -->
<coar-note color="error">
  <strong>Error:</strong> Please fix the following issues before continuing.
</coar-note>

<!-- Accent -->
<coar-note color="accent">
  <strong>Featured:</strong> Check out our new feature!
</coar-note>`,

    padding: `<!-- Small padding -->
<coar-note color="info" padding="sm">
  Compact note with small padding.
</coar-note>

<!-- Medium padding (default) -->
<coar-note color="info" padding="md">
  Standard note with medium padding.
</coar-note>

<!-- Large padding -->
<coar-note color="info" padding="lg">
  Spacious note with large padding.
</coar-note>`,

    richContent: `<coar-note color="warning">
  <h4>Important Notice</h4>
  <p>This action will affect all users in your organization.</p>
  <ul>
    <li>All pending changes will be applied</li>
    <li>Users will be notified via email</li>
    <li>This cannot be reversed</li>
  </ul>
</coar-note>`,

    useCases: `<!-- Documentation tip -->
<coar-note color="info">
  <strong>Pro Tip:</strong> Use keyboard shortcuts for faster navigation.
</coar-note>

<!-- API deprecation warning -->
<coar-note color="warning">
  <strong>Deprecated:</strong> This API will be removed in v3.0.
  Use <code>newMethod()</code> instead.
</coar-note>

<!-- Error guidance -->
<coar-note color="error">
  <strong>Breaking Change:</strong> The signature of this method has changed.
  Please update your code accordingly.
</coar-note>

<!-- Success confirmation -->
<coar-note color="success">
  <strong>Complete:</strong> All tests passed. Ready for deployment.
</coar-note>`,
  };
}
