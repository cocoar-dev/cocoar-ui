import { setupCoarAngularVitest } from '@cocoar/testing-angular';

import { TestBed } from '@angular/core/testing';
import { beforeEach } from 'vitest';
import { provideCoarIconBuiltInSourceAs } from '@cocoar/ui-components';

setupCoarAngularVitest();

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideCoarIconBuiltInSourceAs('core')],
  });
});
