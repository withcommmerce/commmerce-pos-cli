#!/usr/bin/env node

/**
 * CommercePOS Plugin CLI
 *
 * A command-line tool for creating and building CommercePOS plugins.
 * Plugins are built with HTML/CSS/JS and loaded via WebView in the POS app.
 *
 * Usage:
 *   cpos-plugin create <plugin-name>  - Create a new plugin project
 *   cpos-plugin build                 - Build plugin for production
 *   cpos-plugin serve                 - Start development server
 *   cpos-plugin package               - Package plugin for distribution
 */

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');

// Import commands
const createCommand = require('../src/commands/create');
const buildCommand = require('../src/commands/build');
const serveCommand = require('../src/commands/serve');
const packageCommand = require('../src/commands/package');

// CLI version from package.json
const packageJson = require('../package.json');

console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════╗
║       CommercePOS Plugin CLI v${packageJson.version}              ║
║       Build plugins for CommercePOS               ║
╚═══════════════════════════════════════════════════╝
`));

program
  .name('cpos-plugin')
  .description('CLI tool for creating and building CommercePOS plugins')
  .version(packageJson.version);

// Create command
program
  .command('create <plugin-name>')
  .description('Create a new plugin project')
  .option('-t, --template <template>', 'Template to use (basic, payment, report)', 'basic')
  .option('-d, --directory <dir>', 'Directory to create plugin in', '.')
  .action(createCommand);

// Build command
program
  .command('build')
  .description('Build plugin for production')
  .option('-o, --output <dir>', 'Output directory', 'dist')
  .option('--minify', 'Minify output files', true)
  .option('-b, --bundle', 'Create single bundled HTML file with inline CSS/JS')
  .action(buildCommand);

// Serve command
program
  .command('serve')
  .description('Start development server with hot reload')
  .option('-p, --port <port>', 'Port to run server on', '3000')
  .option('--host <host>', 'Host to bind to', 'localhost')
  .action(serveCommand);

// Package command
program
  .command('package')
  .description('Package plugin for distribution (.cposplugin)')
  .option('-o, --output <file>', 'Output file name')
  .action(packageCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
