import { Component, signal } from '@angular/core';
import {
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarProgressBarComponent,
  CoarSpinnerComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [
    CoarProgressBarComponent,
    CoarSpinnerComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
  ],
  templateUrl: './loading.page.html',
  styleUrl: './loading.page.css',
})
export class LoadingPage {
  importCode = `import { CoarProgressBarComponent, CoarSpinnerComponent } from '@cocoar/ui/components';`;

  progressValue = signal(65);

  codeExamples = {
    progressBasic: `<coar-progress-bar [value]="65" label="Upload progress" />`,

    progressVariants: `<coar-progress-bar [value]="75" variant="accent" />
<coar-progress-bar [value]="75" variant="success" />
<coar-progress-bar [value]="75" variant="warning" />
<coar-progress-bar [value]="75" variant="error" />`,

    progressSizes: `<coar-progress-bar [value]="60" size="s" />  <!-- 2px -->
<coar-progress-bar [value]="60" size="m" />  <!-- 4px (default) -->
<coar-progress-bar [value]="60" size="l" />  <!-- 8px -->`,

    progressValue: `<coar-progress-bar [value]="42" [showValue]="true" />`,

    progressIndeterminate: `<coar-progress-bar indeterminate label="Loading..." />`,

    spinnerBasic: `<coar-spinner />`,

    spinnerSizes: `<coar-spinner size="xs" />  <!-- 16px -->
<coar-spinner size="s" />   <!-- 20px -->
<coar-spinner size="m" />   <!-- 24px (default) -->
<coar-spinner size="l" />   <!-- 32px -->`,

    spinnerLabel: `<coar-spinner label="Saving changes" />`,
  };
}
