import type { Page } from '@playwright/test';

export type CtQueryValue = string | number | boolean | undefined | null;

export function scenarioBaseUrl(): string {
  return process.env['SCENARIO_BASE_URL'] || 'http://localhost:4300';
}

export function scenarioUrl(id: string, query?: Record<string, CtQueryValue>): string {
  const url = new URL(`/__scenario/${encodeURIComponent(id)}`, scenarioBaseUrl());

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function gotoScenario(
  page: Page,
  id: string,
  query?: Record<string, CtQueryValue>
): Promise<void> {
  await page.goto(scenarioUrl(id, query), { waitUntil: 'domcontentloaded' });
}
