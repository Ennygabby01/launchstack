import { select } from '@inquirer/prompts';
import ora from 'ora';
import chalk from 'chalk';
import { execa } from 'execa';
import { logger } from './utils/logger.js';
import { resolveDependencies, checkDeprecated } from './utils/dependencies.js';
import { resolveVersions, formatPackageLabel } from './utils/packageResolver.js';
import { guardBeforeInstall } from './utils/freshnessGuard.js';

// ─── Package manager install commands ────────────────────────────────────────

function buildInstallCmd(pm, packages, isDev) {
  // Never pin versions — let the package manager resolve latest stable
  switch (pm) {
    case 'pnpm':
      return ['add', ...packages, ...(isDev ? ['-D'] : [])];
    case 'yarn':
      return ['add', ...packages, ...(isDev ? ['--dev'] : [])];
    default: // npm
      return ['install', ...packages, ...(isDev ? ['--save-dev'] : [])];
  }
}

async function runInstall(pm, packages, isDev, cwd) {
  if (!packages.length) return;
  const args = buildInstallCmd(pm, packages, isDev);
  await execa(pm, args, { cwd, stdio: 'inherit' });
}

// ─── Python setup ─────────────────────────────────────────────────────────────

async function setupPython(config, projectPath) {
  const spinner = ora('Setting up Python virtual environment...').start();
  try {
    await execa('python3', ['-m', 'venv', 'venv'], { cwd: projectPath });
    spinner.succeed('Python virtual environment created');

    const installCmd = config.backendFramework === 'django'
      ? 'pip install django djangorestframework django-cors-headers python-dotenv'
      : 'pip install flask python-dotenv';

    logger.info(`Next: source venv/bin/activate && ${installCmd}`);
  } catch (err) {
    spinner.fail(`Python setup failed: ${err.message}`);
  }
}

// ─── Main installer ───────────────────────────────────────────────────────────

export async function install(config, projectPath) {
  const { deps, devDeps, isPython } = resolveDependencies(config);

  if (isPython) {
    await setupPython(config, projectPath);
    return;
  }

  if (!deps.length && !devDeps.length) {
    logger.info('No dependencies to install.');
    return;
  }

  // Deprecated package check
  const allPkgs = [...deps, ...devDeps];
  const deprecated = checkDeprecated(allPkgs);
  if (deprecated.length) {
    logger.warn('Deprecated packages detected — replacing with modern alternatives:');
    deprecated.forEach(({ pkg, replacement }) => {
      logger.warn(`  ${chalk.red(pkg)} → ${chalk.green(replacement)}`);
    });
  }

  // Freshness guard — warn about stale packages before installing
  await guardBeforeInstall(deps, devDeps);

  const pm = await select({
    message: 'Which package manager do you want to use?',
    choices: [
      { name: 'npm', value: 'npm' },
      { name: 'pnpm', value: 'pnpm' },
      { name: 'yarn', value: 'yarn' },
    ],
    default: 'npm',
  });

  logger.blank();

  // Resolve latest versions for display (non-blocking — failures are silent)
  const resolveSpinner = ora('Resolving latest package versions...').start();
  const versionMap = await resolveVersions(allPkgs);
  resolveSpinner.succeed('Package versions resolved');
  logger.blank();

  // Install production deps
  if (deps.length) {
    deps.forEach((pkg) => logger.info(`Installing ${formatPackageLabel(pkg, versionMap)}`));
    logger.blank();

    const spinner = ora(`Installing ${deps.length} package${deps.length > 1 ? 's' : ''}...`).start();
    try {
      await runInstall(pm, deps, false, projectPath);
      spinner.succeed(`Installed ${deps.length} package${deps.length > 1 ? 's' : ''}`);
    } catch (err) {
      spinner.fail(`Installation failed: ${err.message}`);
      logger.warn(`Run manually: ${pm} ${pm === 'npm' ? 'install' : 'add'} ${deps.join(' ')}`);
    }
  }

  // Install dev deps
  if (devDeps.length) {
    logger.blank();
    devDeps.forEach((pkg) => logger.info(`Installing ${formatPackageLabel(pkg, versionMap)} (dev)`));
    logger.blank();

    const spinner = ora(`Installing ${devDeps.length} dev package${devDeps.length > 1 ? 's' : ''}...`).start();
    try {
      await runInstall(pm, devDeps, true, projectPath);
      spinner.succeed(`Installed ${devDeps.length} dev package${devDeps.length > 1 ? 's' : ''}`);
    } catch (err) {
      spinner.fail(`Dev installation failed: ${err.message}`);
      logger.warn(`Run manually: ${pm} ${pm === 'npm' ? 'install -D' : 'add -D'} ${devDeps.join(' ')}`);
    }
  }
}
