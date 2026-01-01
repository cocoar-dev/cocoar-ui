import { ErrorHandler, Injectable, inject } from '@angular/core';

import { ScenarErrorState } from './scenar-error-state';

@Injectable()
export class ScenarErrorHandler implements ErrorHandler {
  private readonly errorState = inject(ScenarErrorState);

  handleError(error: unknown): void {
    // Show error details in the Backstage UI (including if embedded in an iframe).
    this.errorState.setError(error);

    // Avoid console noise by default; consumers can still attach their own logging.
  }
}
