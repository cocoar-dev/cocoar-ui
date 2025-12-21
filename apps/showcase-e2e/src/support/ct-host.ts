import type { Page } from '@playwright/test';

export type CtQueryValue = string | number | boolean | undefined | null;

export function ctBaseUrl(): string {
  return process.env['CT_BASE_URL'] || 'http://localhost:4300';
}

export function ctUrl(id: string, query?: Record<string, CtQueryValue>): string {
  const url = new URL(`/__ct/${encodeURIComponent(id)}`, ctBaseUrl());

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function gotoCt(
  page: Page,
  id: string,
  query?: Record<string, CtQueryValue>
): Promise<void> {
  await page.goto(ctUrl(id, query), { waitUntil: 'domcontentloaded' });
}
