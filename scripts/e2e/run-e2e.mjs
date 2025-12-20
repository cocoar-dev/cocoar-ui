import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4200';
const PROJECT_ROOT = fileURLToPath(new URL('../../', import.meta.url));

function parseArgs(argv) {
  const args = argv.slice(2);
  const ui = args.includes('--ui');

  let browsers;
  const passthrough = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--ui') continue;

    if (arg === '--browsers' || arg === '--browser') {
      const next = args[i + 1];
      if (next && !next.startsWith('-')) {
        browsers = next;
        i++;
      }
      continue;
    }

    if (arg.startsWith('--browsers=')) {
      browsers = arg.slice('--browsers='.length);
      continue;
    }

    if (arg.startsWith('--browser=')) {
      browsers = arg.slice('--browser='.length);
      continue;
    }

    passthrough.push(arg);
  }

  return { ui, browsers, passthrough };
}

async function waitForHttpOk(url, timeoutMs = 60_000, intervalMs = 500) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) return;
    } catch {
      // ignore until timeout
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(`Timed out waiting for ${url} to become available.`);
}

async function isHttpOk(url) {
  try {
    const response = await fetch(url, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

function killProcessTree(pid) {
  if (!pid) return;

  if (process.platform === 'win32') {
    // Ensure the full child tree is terminated on Windows.
    return new Promise((resolve) => {
      const killer = spawn('taskkill', ['/pid', String(pid), '/T', '/F'], {
        stdio: 'ignore',
        shell: false,
        windowsHide: true,
      });
      killer.on('exit', () => resolve());
      killer.on('error', () => resolve());
    });
  }

  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    // ignore
  }

  return Promise.resolve();
}

async function killWithTimeout(pid, timeoutMs = 10_000) {
  const killer = killProcessTree(pid);
  if (!killer) return;

  await Promise.race([killer, new Promise((resolve) => setTimeout(resolve, timeoutMs))]);
}

function isCi() {
  const ciEnv = process.env.CI;
  return ciEnv === 'true' || ciEnv === '1';
}

async function main() {
  const { ui, browsers, passthrough } = parseArgs(process.argv);

  const alreadyRunning = await isHttpOk(BASE_URL);
  const server = alreadyRunning
    ? null
    : spawn('pnpm', ['exec', 'nx', 'serve', 'showcase'], {
        cwd: PROJECT_ROOT,
        env: {
          ...process.env,
        },
        stdio: 'inherit',
        shell: process.platform === 'win32',
        windowsHide: true,
      });

  let tests = null;
  let shuttingDown = false;
  const cleanupAndExit = async (code) => {
    if (shuttingDown) return;
    shuttingDown = true;

    if (tests?.pid) {
      await killWithTimeout(tests.pid);
    }

    if (server) {
      await killWithTimeout(server.pid);
    }

    process.exit(code);
  };

  process.on('SIGINT', () => {
    void cleanupAndExit(130);
  });
  process.on('SIGTERM', () => {
    void cleanupAndExit(143);
  });

  try {
    if (!alreadyRunning) {
      await waitForHttpOk(BASE_URL);
    }

    const playwrightArgs = [
      'exec',
      'playwright',
      'test',
      '-c',
      'apps/showcase-e2e/playwright.config.ts',
    ];
    if (ui) playwrightArgs.push('--ui');
    playwrightArgs.push(...passthrough);

    tests = spawn('pnpm', playwrightArgs, {
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        BASE_URL,
        COAR_E2E_MANAGED_SERVER: '1',
        COAR_E2E_BROWSERS:
          browsers ?? process.env.COAR_E2E_BROWSERS ?? (isCi() ? 'all' : 'chromium'),
      },
      stdio: 'inherit',
      shell: process.platform === 'win32',
      windowsHide: true,
    });

    const exitCode = await new Promise((resolve) => {
      tests.on('exit', (code) => resolve(code ?? 1));
    });

    await cleanupAndExit(exitCode);
  } catch (error) {
    const message = error instanceof Error ? error.stack || error.message : String(error);
    process.stderr.write(`${message}\n`);
    await cleanupAndExit(1);
  }
}

await main();
