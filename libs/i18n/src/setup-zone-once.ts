// Ensures Zone/Vitest integration is applied exactly once per worker.
// Vitest runs `setupFiles` before each test file; `@analogjs/vitest-angular/setup-zone`
// is intentionally non-idempotent and throws on re-import.
//
// This wrapper checks the global patch flag first and only imports the patch once.
const flags = globalThis as typeof globalThis & { __vitest_zone_patch__?: boolean };

if (flags.__vitest_zone_patch__ !== true) {
  await import('@analogjs/vitest-angular/setup-zone');
}
