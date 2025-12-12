import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';

import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';

const angularTestEnvironmentInitKey = '__coarAngularTestEnvironmentInitialized';
const globalThisTyped = globalThis as typeof globalThis & {
	[angularTestEnvironmentInitKey]?: boolean;
};

if (!globalThisTyped[angularTestEnvironmentInitKey]) {
	globalThisTyped[angularTestEnvironmentInitKey] = true;
	getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}
