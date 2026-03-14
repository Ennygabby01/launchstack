import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { input } from '@inquirer/prompts';
import { detectEnvironment, displayEnvironment } from './environment.js';
import { runPrompts } from './prompts.js';
import { generate, addModule } from './generator.js';
import { install } from './installer.js';
import { logger } from './utils/logger.js';
import { pathExists } from './utils/file.js';
import { checkFreshness, displayFreshnessReport } from './utils/freshnessGuard.js';
import {
  FRAMEWORK_DEPS, DB_DEPS, ORM_DEPS, AUTH_DEPS, MODULE_DEPS, PAYMENT_DEPS,
  FRONTEND_DEPS,
} from './utils/dependencies.js';
import { updateTemplates, listTemplates } from './templates/manager.js';

const LAUNCHSTACK_VERSION = '1.1.6';

function printBanner() {
  console.log('');
  console.log(chalk.bold.cyan('  ⚡ LaunchStack'));
  console.log(chalk.dim('  Production-ready project scaffolding'));
  console.log('');
}

// ─── launchstack init [name] ──────────────────────────────────────────────────

async function cmdInit(name, options) {
  printBanner();
  logger.header('Welcome to LaunchStack');
  logger.blank();

  const env = await detectEnvironment();
  displayEnvironment(env);

  const config = await runPrompts(env);

  if (name) config.projectName = name;

  logger.blank();
  logger.info(`Scaffolding project: ${chalk.bold(config.projectName)}`);
  logger.blank();

  const projectPath = await generate(config);

  if (!options.noInstall) {
    logger.blank();
    await install(config, projectPath);
  }

  logger.blank();
  logger.success('Project ready!');
  logger.blank();
  logger.dim('Next steps:');
  logger.dim(`  cd ${config.projectName}`);
  logger.dim('  cp .env.example .env');
  logger.dim('  npm run dev');
  logger.blank();
}

// ─── launchstack create <type> ────────────────────────────────────────────────

async function cmdCreate(type, options) {
  printBanner();

  const allowedTypes = ['backend', 'frontend', 'fullstack', 'cli', 'microservice', 'worker'];
  if (!allowedTypes.includes(type)) {
    logger.error(`Unknown project type: ${type}`);
    logger.info(`Allowed types: ${allowedTypes.join(', ')}`);
    process.exit(1);
  }

  const env = await detectEnvironment();

  const projectName = await input({
    message: 'Project name:',
    default: options.name || `my-${type}`,
    validate: (v) => /^[a-z0-9-_]+$/i.test(v) || 'Use only letters, numbers, hyphens, underscores',
  });

  const config = await runPrompts(env);
  config.projectName = projectName;
  config.projectType = type;

  const projectPath = await generate(config);

  if (!options.noInstall) {
    logger.blank();
    await install(config, projectPath);
  }

  logger.blank();
  logger.success(`${type} project created: ${projectName}`);
}

// ─── launchstack add <module> ─────────────────────────────────────────────────

async function cmdAdd(moduleName) {
  const cwd = process.cwd();
  const manifestPath = path.join(cwd, 'launchstack.json');

  if (!(await pathExists(manifestPath))) {
    logger.error('Not a launchstack project. Run "launchstack init" first.');
    process.exit(1);
  }

  const validModules = ['logging', 'rate-limit', 'email', 'redis', 'queue', 'file-storage', 'payments', 'swagger', 'validation', 'socket', 'users'];

  if (!validModules.includes(moduleName)) {
    logger.error(`Unknown module: ${moduleName}`);
    logger.info(`Available modules: ${validModules.join(', ')}`);
    process.exit(1);
  }

  await addModule(moduleName, cwd);
}

// ─── launchstack doctor ───────────────────────────────────────────────────────

function getAllTemplateDeps() {
  const all = [
    ...Object.values(FRAMEWORK_DEPS).flat(),
    ...Object.values(DB_DEPS).flat(),
    ...Object.values(ORM_DEPS).flat(),
    ...Object.values(AUTH_DEPS).flat(),
    ...Object.values(MODULE_DEPS).flat(),
    ...Object.values(PAYMENT_DEPS).flat(),
    ...Object.values(FRONTEND_DEPS).flat(),
  ];
  return [...new Set(all.filter(Boolean))];
}

async function cmdDoctor() {
  printBanner();
  logger.header('LaunchStack Doctor');

  // ── Environment check ──────────────────────────────────────────────────────
  const env = await detectEnvironment();
  displayEnvironment(env);

  const issues = [];
  if (!env.node) issues.push('Node.js is required. Install from https://nodejs.org');
  if (!env.npm)  issues.push('npm is required. It comes with Node.js');
  if (!env.git)  issues.push('Git is not installed. Install from https://git-scm.com');

  if (issues.length) {
    logger.warn('Issues found:');
    issues.forEach((i) => logger.error(i));
  } else {
    logger.success('All required tools are installed!');
  }

  if (!env.docker) logger.warn('Docker not found — Docker setup will be skipped during scaffolding');
  if (!env.ollama) logger.info('Ollama not found — AI mode will use GitHub Copilot or fallback to manual');

  // ── Template dependency freshness scan ─────────────────────────────────────
  logger.blank();
  logger.info('Checking template dependencies...');
  logger.blank();

  const packages = getAllTemplateDeps();
  const results = await checkFreshness(packages);
  displayFreshnessReport(results);

  const staleCount = results.filter((r) => r.stale).length;
  if (staleCount === 0) {
    logger.success('All template dependencies are up to date!');
  } else {
    logger.warn(`${staleCount} package(s) may need attention — Launchstack always installs latest stable versions.`);
  }

  logger.blank();
}

// ─── CLI Setup ────────────────────────────────────────────────────────────────

export function createCLI() {
  const program = new Command();

  program
    .name('launchstack')
    .description('CLI tool for scaffolding production-ready projects')
    .version(LAUNCHSTACK_VERSION, '-v, --version', 'Output the current version');

  program
    .command('init [name]')
    .description('Initialize a new project interactively')
    .option('--no-install', 'Skip dependency installation')
    .action(cmdInit);

  program
    .command('create <type>')
    .description('Quickly create a project by type: backend | frontend | fullstack | cli | microservice | worker')
    .option('-n, --name <name>', 'Project name')
    .option('--no-install', 'Skip dependency installation')
    .action(cmdCreate);

  program
    .command('add <module>')
    .description('Add a module to an existing launchstack project')
    .action(cmdAdd);

  program
    .command('doctor')
    .description('Check environment and tool availability')
    .action(cmdDoctor);

  // launchstack templates <update|list>
  const templatesCmd = program
    .command('templates')
    .description('Manage Launchstack templates');

  templatesCmd
    .command('update')
    .description('Pull the latest templates from the remote registry')
    .action(async () => {
      printBanner();
      await updateTemplates();
    });

  templatesCmd
    .command('list')
    .description('List all available templates (categories and variants)')
    .action(async () => {
      printBanner();
      await listTemplates();
    });

  // Default: run interactive wizard when no subcommand given
  if (process.argv.length <= 2) {
    cmdInit(undefined, { install: true });
    return;
  }

  program.parse(process.argv);
}
