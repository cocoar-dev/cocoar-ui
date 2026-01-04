import { setupCoarAngularVitest } from '@cocoar/testing-angular';

import { TestBed } from '@angular/core/testing';
import { beforeEach } from 'vitest';
import { provideCoarIconBuiltInSourceAs } from './lib/coar-icon/coar-icon-built-in-registry';

setupCoarAngularVitest();

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideCoarIconBuiltInSourceAs('core')],
  });
});
