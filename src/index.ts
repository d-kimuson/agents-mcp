#!/usr/bin/env node

import { Command } from 'commander';
import { writeFileSync } from 'node:fs';
import packageJson from '../package.json' with { type: 'json' };
import { loadConfig } from './config/loader.js';
import { startServer } from './server.js';
import { logger } from './utils/logger.js';

const defaultConfig = {
  agents: [
    {
      name: 'coding',
      description: 'For implementing programs',
      agents: [
        {
          type: 'claude-code',
        },
      ],
    },
    {
      name: 'architect',
      description: 'For architecture design',
      agents: [
        {
          type: 'codex',
        },
      ],
    },
    {
      name: 'review',
      description: 'For code review',
      prompt:
        'You are an experienced code reviewer. Review the code provided by the user and suggest improvements.',
      agents: [
        {
          type: 'codex',
        },
      ],
    },
    {
      name: 'qa',
      description: 'For quality assurance',
      prompt:
        'You are an experienced QA engineer. Test the deliverables provided by the user and check for any issues.',
      agents: [
        {
          type: 'claude-code',
        },
      ],
    },
    {
      name: 'research',
      description: 'For web research',
      agents: [
        {
          type: 'gemini-cli',
          model: 'gemini-2.0-flash-exp',
        },
      ],
    },
    {
      name: 'writing',
      description: 'For writing documents',
      agents: [
        {
          type: 'gemini-cli',
          model: 'gemini-2.0-flash-exp',
        },
      ],
    },
    {
      name: 'translation',
      description: 'For translation',
      prompt:
        'You are a professional translator. Translate the text provided by the user into the specified language with natural phrasing.',
      agents: [
        {
          type: 'gemini-cli',
          model: 'gemini-2.0-flash-exp',
        },
      ],
    },
  ],
};

const program = new Command();

program.name(packageJson.name).version(packageJson.version).description(packageJson.description);

program
  .command('serve')
  .description('Start the MCP server')
  .argument('<config>', 'Path to the configuration file')
  .action(async (configPath: string) => {
    try {
      const config = loadConfig(configPath);
      await startServer(config);
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize a new configuration file')
  .option('-o, --output <path>', 'Output file path', 'agents-mcp.config.json')
  .action((options: { output: string }) => {
    try {
      writeFileSync(options.output, JSON.stringify(defaultConfig, null, 2) + '\n', 'utf-8');
      logger.info(`Configuration file created at: ${options.output}`);
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  });

program.parse();
