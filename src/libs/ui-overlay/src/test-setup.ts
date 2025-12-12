import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';

import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';
import { beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';

const angularTestEnvironmentInitKey = '__coarAngularTestEnvironmentInitialized';
const globalThisTyped = globalThis as typeof globalThis & {
  [angularTestEnvironmentInitKey]?: boolean;
};

if (!globalThisTyped[angularTestEnvironmentInitKey]) {
  globalThisTyped[angularTestEnvironmentInitKey] = true;
  getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

beforeEach(() => {
  TestBed.resetTestingModule();
});
