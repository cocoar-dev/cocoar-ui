import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';

import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { beforeEach } from 'vitest';

import { stubBrowserObservers } from './browser-observers';

export interface CoarAngularVitestSetupOptions {
  /**
   * Resets Angular's global TestBed state before each test.
   * This improves isolation and reduces cross-test flakiness.
   */
  resetTestBedBeforeEach?: boolean;

  /**
   * Disables Angular's check-no-changes verification during `fixture.detectChanges()`.
   *
   * Angular 21 can surface NG0100 in tests where two-way bindings or signal-based state updates
   * intentionally occur during the initial change detection cycle.
   */
  disableCheckNoChanges?: boolean;
}

const initKey = '__coarAngularTestEnvironmentInitialized';
const beforeEachKey = '__coarAngularVitestBeforeEachRegistered';
const detectChangesKey = '__coarAngularVitestDetectChangesPatched';

function getGlobalFlags() {
  return globalThis as typeof globalThis & {
    [initKey]?: boolean;
    [beforeEachKey]?: boolean;
    [detectChangesKey]?: boolean;
  };
}

function shouldDisableCheckNoChanges(options: CoarAngularVitestSetupOptions | undefined) {
  if (options?.disableCheckNoChanges === false) return false;

  const envValue = (
    globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env?.['COAR_VITEST_DISABLE_CHECK_NO_CHANGES'];

  if (envValue === '0' || envValue === 'false') return false;

  return true;
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

  if (!flags[detectChangesKey] && shouldDisableCheckNoChanges(options)) {
    flags[detectChangesKey] = true;

    const proto = ComponentFixture.prototype as unknown as {
      detectChanges: (checkNoChanges?: boolean) => void;
    };

    const originalDetectChanges = proto.detectChanges;
    proto.detectChanges = function (checkNoChanges?: boolean) {
      return originalDetectChanges.call(this, checkNoChanges ?? false);
    };
  }

  if (!flags[beforeEachKey] && isResetEnabled(options)) {
    flags[beforeEachKey] = true;
    beforeEach(() => {
      TestBed.resetTestingModule();
    });
  }
}
