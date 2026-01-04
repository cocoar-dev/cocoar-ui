import { setupCoarAngularVitest } from '@cocoar/testing-angular';

import { TestBed } from '@angular/core/testing';
import { beforeEach } from 'vitest';
import { provideCoarIconBuiltInSourceAs } from './lib/coar-icon/coar-icon-built-in-registry';

setupCoarAngularVitest();

beforeEach(() => {
  const flags = globalThis as typeof globalThis & {
    __coarUiComponentsDisableDefaultIconRegistry?: boolean;
  };

  if (flags.__coarUiComponentsDisableDefaultIconRegistry) return;

  TestBed.configureTestingModule({
    providers: [provideCoarIconBuiltInSourceAs('core')],
  });
});
