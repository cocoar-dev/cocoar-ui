import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4200';
const PROJECT_ROOT = fileURLToPath(new URL('../../', import.meta.url));

function parseArgs(argv) {
  const args = argv.slice(2);
  const ui = args.includes('--ui');
  const passthrough = args.filter((a) => a !== '--ui');
  return { ui, passthrough };
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
    spawn('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }

  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    // ignore
  }
}

async function main() {
  const { ui, passthrough } = parseArgs(process.argv);

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
      });

  const cleanupAndExit = (code) => {
    if (server) {
      killProcessTree(server.pid);
    }
    process.exit(code);
  };

  process.on('SIGINT', () => cleanupAndExit(130));
  process.on('SIGTERM', () => cleanupAndExit(143));

  try {
    if (!alreadyRunning) {
      await waitForHttpOk(BASE_URL);
    }

    const playwrightArgs = ['exec', 'playwright', 'test', '-c', 'apps/showcase-e2e/playwright.config.ts'];
    if (ui) playwrightArgs.push('--ui');
    playwrightArgs.push(...passthrough);

    const tests = spawn('pnpm', playwrightArgs, {
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        BASE_URL,
        COAR_E2E_MANAGED_SERVER: '1',
      },
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    const exitCode = await new Promise((resolve) => {
      tests.on('exit', (code) => resolve(code ?? 1));
    });

    cleanupAndExit(exitCode);
  } catch (error) {
    const message = error instanceof Error ? (error.stack || error.message) : String(error);
    process.stderr.write(`${message}\n`);
    cleanupAndExit(1);
  }
}

await main();
