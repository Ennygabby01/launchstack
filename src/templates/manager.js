import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { TEMPLATE_REGISTRY } from './registry.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bundled templates shipped with the CLI (fallback)
const BUNDLED_TEMPLATES_DIR = path.resolve(__dirname, '../../templates');

const { githubRepo, branch, cacheDir } = TEMPLATE_REGISTRY;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function cacheExists() {
  return fs.pathExists(path.join(cacheDir, '.git'));
}

async function isOnline() {
  try {
    await fetch('https://github.com', { method: 'HEAD', signal: AbortSignal.timeout(4000) });
    return true;
  } catch {
    return false;
  }
}

// ─── Clone templates from registry ───────────────────────────────────────────

async function cloneTemplates() {
  await fs.ensureDir(path.dirname(cacheDir));
  await execa('git', ['clone', '--depth', '1', '--branch', branch, githubRepo, cacheDir]);
}

// ─── Pull latest templates ────────────────────────────────────────────────────

async function pullTemplates() {
  await execa('git', ['-C', cacheDir, 'pull', '--ff-only', 'origin', branch]);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Ensure templates are available locally. Called automatically before scaffold.
 * - If cache exists: pull updates (silent fail if offline).
 * - If no cache: clone from registry, or fallback to bundled if offline.
 */
export async function ensureTemplates() {
  const online = await isOnline();

  if (await cacheExists()) {
    if (online) {
      const spinner = ora('Checking template updates...').start();
      try {
        await pullTemplates();
        spinner.succeed('Templates up to date');
      } catch {
        spinner.warn('Could not update templates — using cached version');
      }
    } else {
      logger.info('Registry unreachable. Using cached templates.');
    }
    return cacheDir;
  }

  // No cache yet
  if (!online) {
    logger.info('Registry unreachable. Using bundled templates.');
    return BUNDLED_TEMPLATES_DIR;
  }

  const spinner = ora('Downloading templates from registry...').start();
  try {
    await cloneTemplates();
    spinner.succeed('Templates downloaded');
    return cacheDir;
  } catch (err) {
    spinner.fail(`Could not download templates: ${err.message}`);
    logger.info('Falling back to bundled templates.');
    return BUNDLED_TEMPLATES_DIR;
  }
}

/**
 * Force-pull the latest templates. Used by `launchstack templates update`.
 */
export async function updateTemplates() {
  logger.info('Updating Launchstack templates...');

  const online = await isOnline();
  if (!online) {
    logger.error('Registry unreachable. Check your internet connection.');
    return false;
  }

  const spinner = ora('Fetching latest templates...').start();
  try {
    if (await cacheExists()) {
      await pullTemplates();
    } else {
      await cloneTemplates();
    }
    spinner.succeed('Templates successfully updated.');
    return true;
  } catch (err) {
    spinner.fail(`Update failed: ${err.message}`);
    return false;
  }
}

/**
 * List available template categories from the active templates directory.
 */
export async function listTemplates() {
  const dir = (await cacheExists()) ? cacheDir : BUNDLED_TEMPLATES_DIR;

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const categories = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name);

    logger.blank();
    logger.header('Available templates:');
    logger.blank();

    for (const cat of categories) {
      const catPath = path.join(dir, cat);
      const sub = await fs.readdir(catPath, { withFileTypes: true });
      const variants = sub
        .filter((e) => e.isDirectory())
        .map((e) => e.name);

      console.log(chalk.cyan(`  ${cat}/`));
      variants.forEach((v) => console.log(chalk.dim(`    ${v}`)));
    }

    logger.blank();
    const source = (await cacheExists()) ? chalk.green('remote cache') : chalk.yellow('bundled (local)');
    logger.dim(`Source: ${source}  (${dir})`);
    logger.blank();
  } catch (err) {
    logger.error(`Could not read templates: ${err.message}`);
  }
}

/**
 * Resolve the active templates directory (cache or bundled).
 */
export async function getTemplatesDir() {
  if (await cacheExists()) return cacheDir;
  return BUNDLED_TEMPLATES_DIR;
}
