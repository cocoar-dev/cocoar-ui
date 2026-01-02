import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TARGET_PROJECT = process.env.NX_TASK_TARGET_PROJECT;

function resolvePlaywrightConfigPath() {
  const explicit = process.env.PLAYWRIGHT_CONFIG;
  if (explicit && existsSync(explicit)) return explicit;

  if (TARGET_PROJECT) {
    const candidate = `apps/${TARGET_PROJECT}/playwright.config.ts`;
    if (existsSync(candidate)) return candidate;
  }

  return 'apps/showcase-e2e/playwright.config.ts';
}

const PLAYWRIGHT_CONFIG_PATH = resolvePlaywrightConfigPath();

const DEFAULT_BASE_URL =
  TARGET_PROJECT === 'scenar-backstage-e2e' ? 'http://localhost:4300' : 'http://localhost:4200';

const BASE_URL = process.env.BASE_URL || DEFAULT_BASE_URL;

// Prefer the Scenario host naming, but keep CT_BASE_URL as a backward-compatible alias.
// For scenar-backstage-e2e, the scenario host *is* the app under test.
const DEFAULT_SCENARIO_BASE_URL = 'http://localhost:4300';
const SCENARIO_BASE_URL =
  TARGET_PROJECT === 'scenar-backstage-e2e'
    ? BASE_URL
    : process.env.SCENARIO_BASE_URL || process.env.CT_BASE_URL || DEFAULT_SCENARIO_BASE_URL;
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

function parseCommand(command) {
  if (!command) return null;

  const trimmed = String(command).trim();
  if (!trimmed) return null;

  // Minimal parser: supports quoted segments and whitespace.
  const parts = trimmed.match(/"(?:\\.|[^\\"])*"|\S+/g) ?? [];
  const argv = parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith('"') && part.endsWith('"')) return part.slice(1, -1);
      return part;
    });

  if (argv.length === 0) return null;
  return { file: argv[0], args: argv.slice(1) };
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
  const scenarioAlreadyRunning = await isHttpOk(SCENARIO_BASE_URL);

  const baseServerArgs =
    TARGET_PROJECT === 'scenar-backstage-e2e'
      ? ['exec', 'nx', 'serve', 'scenar-backstage']
      : ['exec', 'nx', 'serve', 'showcase'];

  const server = alreadyRunning
    ? null
    : spawn('pnpm', baseServerArgs, {
        cwd: PROJECT_ROOT,
        env: {
          ...process.env,
        },
        stdio: 'inherit',
        shell: process.platform === 'win32',
        windowsHide: true,
      });

  const shouldStartScenarioServer = TARGET_PROJECT !== 'scenar-backstage-e2e';

  const scenarioServer =
    !shouldStartScenarioServer || scenarioAlreadyRunning
      ? null
      : (() => {
          const configured = parseCommand(process.env.SCENARIO_SERVER_COMMAND);

          // Default assumes the external Scenar package exposes a CLI named `scenar`.
          // Use `--` so the command form matches other consumer commands like:
          // `pnpm exec scenar -- init` / `pnpm exec scenar -- generate`.
          // Consumers can override via SCENARIO_SERVER_COMMAND.
          const defaultCommand = { file: 'pnpm', args: ['exec', 'scenar', '--', 'serve'] };
          const command = configured ?? defaultCommand;

          return spawn(command.file, command.args, {
            cwd: PROJECT_ROOT,
            env: {
              ...process.env,
            },
            stdio: 'inherit',
            shell: process.platform === 'win32',
            windowsHide: true,
          });
        })();

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

    if (scenarioServer) {
      await killWithTimeout(scenarioServer.pid);
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

    if (shouldStartScenarioServer && !scenarioAlreadyRunning) {
      await waitForHttpOk(SCENARIO_BASE_URL);
    }

    const playwrightArgs = ['exec', 'playwright', 'test', '-c', PLAYWRIGHT_CONFIG_PATH];
    if (ui) playwrightArgs.push('--ui');
    playwrightArgs.push(...passthrough);

    tests = spawn('pnpm', playwrightArgs, {
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        BASE_URL,
        // Export both so older helpers/scripts still work.
        SCENARIO_BASE_URL,
        CT_BASE_URL: process.env.CT_BASE_URL || SCENARIO_BASE_URL,
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
