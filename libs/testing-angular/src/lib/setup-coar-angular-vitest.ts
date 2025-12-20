import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';

import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { beforeEach } from 'vitest';

import { stubBrowserObservers } from './browser-observers';

export interface CoarAngularVitestSetupOptions {
  /**
   * Resets Angular's global TestBed state before each test.
   * This improves isolation and reduces cross-test flakiness.
   */
  resetTestBedBeforeEach?: boolean;
}

const initKey = '__coarAngularTestEnvironmentInitialized';
const beforeEachKey = '__coarAngularVitestBeforeEachRegistered';

function getGlobalFlags() {
  return globalThis as typeof globalThis & {
    [initKey]?: boolean;
    [beforeEachKey]?: boolean;
  };
}

function isResetEnabled(options: CoarAngularVitestSetupOptions | undefined) {
  if (options?.resetTestBedBeforeEach === false) return false;

  const envValue = (
    globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env?.['COAR_VITEST_RESET_TESTBED'];
  if (envValue === '0' || envValue === 'false') return false;

  return true;
}

export function setupCoarAngularVitest(options: CoarAngularVitestSetupOptions = {}): void {
  const flags = getGlobalFlags();

  stubBrowserObservers();

  if (!flags[initKey]) {
    flags[initKey] = true;
    getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  }

  if (!flags[beforeEachKey] && isResetEnabled(options)) {
    flags[beforeEachKey] = true;
    beforeEach(() => {
      TestBed.resetTestingModule();
    });
  }
}
