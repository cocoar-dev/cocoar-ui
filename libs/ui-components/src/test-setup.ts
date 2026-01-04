import { setupCoarAngularVitest } from '@cocoar/testing-angular';

import { TestBed } from '@angular/core/testing';
import { beforeEach } from 'vitest';

setupCoarAngularVitest();

beforeEach(() => {
  TestBed.configureTestingModule({});
});
