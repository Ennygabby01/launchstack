import chalk from 'chalk';
import { logger } from './logger.js';

const NPM_REGISTRY = 'https://registry.npmjs.org';
const STALE_MONTHS = 12;

/**
 * Fetch full package metadata (not just /latest) to get time.modified.
 */
async function fetchPackageMeta(packageName) {
  try {
    const encoded = encodeURIComponent(packageName);
    const res = await fetch(`${NPM_REGISTRY}/${encoded}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const latestVersion = data['dist-tags']?.latest ?? null;
    const modified = data.time?.modified ?? null;

    return { name: packageName, version: latestVersion, modified };
  } catch {
    return null;
  }
}

function isStale(modifiedISO) {
  if (!modifiedISO) return false;
  const modified = new Date(modifiedISO);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - STALE_MONTHS);
  return modified < cutoff;
}

/**
 * Check a list of packages for freshness. Returns an array of results:
 * { name, version, modified, stale, error }
 */
export async function checkFreshness(packages) {
  const results = await Promise.all(
    packages.map(async (pkg) => {
      const meta = await fetchPackageMeta(pkg);
      if (!meta) return { name: pkg, version: null, modified: null, stale: false, error: true };
      return { ...meta, stale: isStale(meta.modified) };
    })
  );
  return results;
}

/**
 * Display freshness results in the CLI.
 */
export function displayFreshnessReport(results) {
  logger.blank();
  logger.header('Template Dependency Freshness Check');
  logger.blank();

  for (const pkg of results) {
    if (pkg.error) {
      console.log(chalk.dim(`  ${pkg.name}  (could not reach registry)`));
      continue;
    }

    const versionLabel = pkg.version ? chalk.dim(`v${pkg.version}`) : '';

    if (pkg.stale) {
      console.log(chalk.yellow(`  ⚠  ${pkg.name} ${versionLabel}  — last updated >12 months ago`));
      logger.warn(
        `     The template dependency "${pkg.name}" appears outdated.\n` +
        `     Latest: ${pkg.version ?? 'unknown'}\n` +
        `     Shipstack will install the latest stable version automatically.`
      );
    } else {
      console.log(chalk.green(`  ✔  ${pkg.name} ${versionLabel}`));
    }
  }

  logger.blank();
}

/**
 * Run freshness guard before installation.
 * Warns about stale packages but does not block install.
 */
export async function guardBeforeInstall(deps, devDeps) {
  const allPkgs = [...new Set([...deps, ...devDeps])];
  if (!allPkgs.length) return;

  const results = await checkFreshness(allPkgs);
  const stale = results.filter((r) => r.stale);

  if (stale.length) {
    logger.blank();
    logger.warn(`${stale.length} package(s) have not been updated in over ${STALE_MONTHS} months:`);
    stale.forEach((r) => {
      logger.warn(`  ${chalk.yellow(r.name)}  (latest: ${r.version ?? 'unknown'}, last modified: ${r.modified?.slice(0, 10) ?? 'unknown'})`);
    });
    logger.info('Shipstack will install the latest stable versions automatically.');
    logger.blank();
  }
}
