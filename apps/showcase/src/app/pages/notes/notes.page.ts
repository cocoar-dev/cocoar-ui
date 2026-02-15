import { Component } from '@angular/core';

import {
  CoarNoteComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    CoarNoteComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
  ],
  templateUrl: './notes.page.html',
  styleUrl: './notes.page.css',
})
export class NotesPage {
  importCode = `import { CoarNoteComponent } from '@cocoar/ui/components';`;

  /** Code examples */
  codeExamples = {
    colors: `<!-- Neutral (default) -->
<coar-note variant="neutral">
  <strong>Note:</strong> General information for the user.
</coar-note>

<!-- Info -->
<coar-note variant="info">
  <strong>Tip:</strong> Here's a helpful tip to improve your workflow.
</coar-note>

<!-- Success -->
<coar-note variant="success">
  <strong>Success:</strong> Your changes have been saved successfully.
</coar-note>

<!-- Warning -->
<coar-note variant="warning">
  <strong>Warning:</strong> This action cannot be undone.
</coar-note>

<!-- Error -->
<coar-note variant="error">
  <strong>Error:</strong> Please fix the following issues before continuing.
</coar-note>

<!-- Accent -->
<coar-note variant="accent">
  <strong>Featured:</strong> Check out our new feature!
</coar-note>`,

    padding: `<!-- Small padding -->
<coar-note variant="info" padding="s">
  Compact note with small padding.
</coar-note>

<!-- Medium padding (default) -->
<coar-note variant="info" padding="m">
  Standard note with medium padding.
</coar-note>

<!-- Large padding -->
<coar-note variant="info" padding="l">
  Spacious note with large padding.
</coar-note>`,

    richContent: `<coar-note variant="warning">
  <h4>Important Notice</h4>
  <p>This action will affect all users in your organization.</p>
  <ul>
    <li>All pending changes will be applied</li>
    <li>Users will be notified via email</li>
    <li>This cannot be reversed</li>
  </ul>
</coar-note>`,

    useCases: `<!-- Documentation tip -->
<coar-note variant="info">
  <strong>Pro Tip:</strong> Use keyboard shortcuts for faster navigation.
</coar-note>

<!-- API deprecation warning -->
<coar-note variant="warning">
  <strong>Deprecated:</strong> This API will be removed in v3.0.
  Use <code>newMethod()</code> instead.
</coar-note>

<!-- Error guidance -->
<coar-note variant="error">
  <strong>Breaking Change:</strong> The signature of this method has changed.
  Please update your code accordingly.
</coar-note>

<!-- Success confirmation -->
<coar-note variant="success">
  <strong>Complete:</strong> All tests passed. Ready for deployment.
</coar-note>`,
  };
}
