#!/usr/bin/env node

import { Command } from 'commander';
import { consola } from 'consola';
import { loadConfig, validateConfig, createDefaultConfig } from '../config/index.js';
import { executeBuild } from './commands/build.js';
import { executeClean } from './commands/clean.js';
import { executeWatch } from './commands/watch.js';

// Package info (will be populated from package.json at build time)
const VERSION = '0.1.0';
const NAME = 'plasmo-layout';

/**
 * Create and configure the CLI program
 */
function createProgram(): Command {
  const program = new Command()
    .name(NAME)
    .description('Automate HTML layout generation for Plasmo browser extension components')
    .version(VERSION);

  // Build command
  program
    .command('build')
    .description('Scan components for @layout decorators and generate HTML files')
    .option('-c, --config <path>', 'Path to config file')
    .option('-r, --root <path>', 'Project root directory', process.cwd())
    .option('-v, --verbose', 'Enable verbose logging')
    .action(async (options) => {
      try {
        const config = await loadConfig(options.root, options.config);
        
        if (options.verbose) {
          config.verbose = true;
          consola.level = 4; // Debug level
        }

        validateConfig(config);
        await executeBuild(config);
      } catch (error) {
        consola.error(error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  // Watch command
  program
    .command('watch')
    .description('Watch for file changes and rebuild incrementally')
    .option('-c, --config <path>', 'Path to config file')
    .option('-r, --root <path>', 'Project root directory', process.cwd())
    .option('-v, --verbose', 'Enable verbose logging')
    .action(async (options) => {
      try {
        const config = await loadConfig(options.root, options.config);
        
        if (options.verbose) {
          config.verbose = true;
          consola.level = 4;
        }

        validateConfig(config);

        // Run initial build
        consola.info('Running initial build...');
        await executeBuild(config);

        // Start watching
        const controller = await executeWatch(config);

        // Handle graceful shutdown
        const shutdown = async () => {
          consola.info('\nShutting down...');
          await controller.stop();
          process.exit(0);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
      } catch (error) {
        consola.error(error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  // Clean command
  program
    .command('clean')
    .description('Remove all generated HTML files')
    .option('-c, --config <path>', 'Path to config file')
    .option('-r, --root <path>', 'Project root directory', process.cwd())
    .option('-d, --dry-run', 'Show what would be deleted without actually deleting')
    .option('-v, --verbose', 'Enable verbose logging')
    .action(async (options) => {
      try {
        const config = await loadConfig(options.root, options.config);
        
        if (options.verbose) {
          config.verbose = true;
          consola.level = 4;
        }

        validateConfig(config);
        await executeClean(config, options.dryRun);
      } catch (error) {
        consola.error(error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  // Init command
  program
    .command('init')
    .description('Create a default configuration file')
    .option('-r, --root <path>', 'Project root directory', process.cwd())
    .option('-t, --typescript', 'Create TypeScript config file')
    .action(async (options) => {
      try {
        const format = options.typescript ? 'ts' : 'js';
        await createDefaultConfig(options.root, format);
      } catch (error) {
        consola.error(error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return program;
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const program = createProgram();
  await program.parseAsync(process.argv);
}

// Run CLI
main().catch((error) => {
  consola.error('Fatal error:', error);
  process.exit(1);
});
