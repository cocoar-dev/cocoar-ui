import '@angular/compiler';

import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { beforeEach } from 'vitest';

const initKey = '__coarI18nAngularTestEnvironmentInitialized';
const flags = globalThis as typeof globalThis & { [initKey]?: boolean };

if (!flags[initKey]) {
  flags[initKey] = true;
  getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

beforeEach(() => {
  TestBed.resetTestingModule();
});
