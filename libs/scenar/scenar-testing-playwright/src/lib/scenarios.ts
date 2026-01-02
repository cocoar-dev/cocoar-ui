import type { Page } from '@playwright/test';

import { serializeWithCodecs } from './scenario-codecs';

export interface OpenScenarioOptions {
  timeout?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
}

export async function openScenario(
  page: Page,
  scenarioId: string,
  inputs?: Record<string, unknown>,
  options?: OpenScenarioOptions
): Promise<void> {
  const timeout = options?.timeout ?? 30_000;
  const waitUntil = options?.waitUntil ?? 'networkidle';

  const url = new URL(`/__scenario/${encodeURIComponent(scenarioId)}`, 'http://dummy');

  if (inputs) {
    for (const [key, value] of Object.entries(inputs)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, serializeWithCodecs(value));
      }
    }
  }

  await page.goto(url.pathname + url.search, { timeout, waitUntil });
}
