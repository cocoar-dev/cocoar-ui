#!/usr/bin/env node

import { createSkill } from './create-skill.mjs';
import { setupAgents } from './setup-agents.mjs';

const HELP = `
Usage: npx @cocoar/ui-docs <command> [options]

Commands:
  create-skill    Create Agent Skill for GitHub Copilot
  setup-agents    Add/update AGENTS.md section
  init            Run both create-skill and setup-agents
  help            Show this help message

Options:
  --force         Overwrite existing files
  --help, -h      Show help

Examples:
  npx @cocoar/ui-docs init
  npx @cocoar/ui-docs create-skill
  npx @cocoar/ui-docs setup-agents --force

About Agent Skills:
  Agent Skills enable GitHub Copilot to access Cocoar component
  documentation on-demand. Learn more at https://agentskills.io

About AGENTS.md:
  AGENTS.md provides guidance to AI assistants (Copilot, Claude, etc.)
  about where to find Cocoar documentation.
`;

function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const flags = {
    force: args.includes('--force'),
    help: args.includes('--help') || args.includes('-h'),
  };
  return { command, flags };
}

async function main() {
  const { command, flags } = parseArgs();

  if (flags.help || !command || command === 'help') {
    console.log(HELP);
    process.exit(0);
  }

  try {
    switch (command) {
      case 'create-skill': {
        createSkill({ force: flags.force });
        break;
      }

      case 'setup-agents': {
        setupAgents({ force: flags.force });
        break;
      }

      case 'init': {
        console.log('Setting up Cocoar documentation for AI assistants...\n');
        createSkill({ force: flags.force });
        console.log('');
        setupAgents({ force: flags.force });
        console.log('\n✓ Setup complete!');
        console.log('  Your AI assistant can now access Cocoar documentation.');
        break;
      }

      default: {
        console.error(`✗ Unknown command: ${command}`);
        console.log(HELP);
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

main();
