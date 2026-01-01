import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import { vi } from 'vitest';

setupTestBed();

// Mock the generated registry module for tests
vi.mock('@scenar/registry', () => ({
  SCENAR_REGISTRY_INDEX: {},
  SCENAR_REGISTRY_IDS: [],
  SCENAR_REGISTRY_SCHEMA_VERSION: 2,
}));
