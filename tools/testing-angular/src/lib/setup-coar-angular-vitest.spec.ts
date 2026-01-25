import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { setupCoarAngularVitest } from './setup-coar-angular-vitest';

describe('setupCoarAngularVitest', () => {
  it('initializes Angular TestBed without throwing', () => {
    expect(() => setupCoarAngularVitest()).not.toThrow();
    expect(TestBed).toBeDefined();
  });

  it('keeps TestBed usable after multiple calls', () => {
    setupCoarAngularVitest();
    setupCoarAngularVitest();

    expect(() => TestBed.configureTestingModule({})).not.toThrow();
  });
});
