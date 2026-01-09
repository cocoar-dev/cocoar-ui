#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Creates the Agent Skill directory and SKILL.md file in the consumer's repository.
 */
export function createSkill(options = {}) {
  const { force = false, cwd = process.cwd() } = options;

  const skillDir = join(cwd, '.github', 'skills', 'cocoar-component-usage');
  const skillFile = join(skillDir, 'SKILL.md');
  const templatePath = join(__dirname, 'templates', 'SKILL.md');

  // Check if skill already exists
  if (existsSync(skillFile) && !force) {
    console.log('✓ Agent Skill already exists at .github/skills/cocoar-component-usage/');
    console.log('  Run with --force to overwrite.');
    return { created: false, path: skillFile };
  }

  // Create directory structure
  mkdirSync(skillDir, { recursive: true });

  // Read template and write to target
  const template = readFileSync(templatePath, 'utf-8');
  writeFileSync(skillFile, template, 'utf-8');

  console.log('✓ Agent Skill created at .github/skills/cocoar-component-usage/');
  console.log('  GitHub Copilot will now load Cocoar documentation on-demand.');

  return { created: true, path: skillFile };
}
