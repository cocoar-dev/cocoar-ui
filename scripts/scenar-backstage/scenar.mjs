#!/usr/bin/env node

import { spawn } from 'node:child_process';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(process.cwd());

function printUsage() {
  process.stdout.write(
    [
      'Usage: scenar <command> [-- <extra args>]',
      '',
      'Commands:',
      '  check       Run the scenario metadata import guardrail',
      '  generate    Generate the scenario registry',
      '  serve       Serve the host (Nx: component-test-host:serve)',
      '  export      Export files for extracting Scenar Backstage into a new repo',
      '',
      'Examples:',
      '  node scripts/scenar-backstage/scenar.mjs check',
      '  node scripts/scenar-backstage/scenar.mjs generate',
      '  node scripts/scenar-backstage/scenar.mjs serve -- --configuration=development',
      '  node scripts/scenar-backstage/scenar.mjs export -- --out tmp/scenar-backstage-export',
      '',
    ].join('\n')
  );
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('exit', (code) => resolve(code ?? 1));
  });
}

function splitArgs(argv) {
  const idx = argv.indexOf('--');
  if (idx === -1) return { head: argv, tail: [] };
  return { head: argv.slice(0, idx), tail: argv.slice(idx + 1) };
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes('-h') || argv.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const { head, tail } = splitArgs(argv);
  const command = head[0];

  if (command === 'check') {
    process.exit(await run('node', ['scripts/scenar-backstage/check-scenar-scenario-imports.mjs']));
  }

  if (command === 'generate') {
    process.exit(await run('node', ['scripts/scenar-backstage/generate-scenar-registry.mjs']));
  }

  if (command === 'serve') {
    process.exit(await run('pnpm', ['nx', 'serve', 'component-test-host', ...tail]));
  }

  if (command === 'export') {
    process.exit(await run('node', ['scripts/scenar-backstage/scenar-export.mjs', ...tail]));
  }

  process.stderr.write(`Unknown command: ${command}\n\n`);
  printUsage();
  process.exit(1);
}

await main();
