const NPM_REGISTRY = 'https://registry.npmjs.org';

/**
 * Fetch the latest published version of a package from the npm registry.
 * Returns the version string, or null on failure.
 */
export async function getLatestVersion(packageName) {
  try {
    const encoded = encodeURIComponent(packageName);
    const res = await fetch(`${NPM_REGISTRY}/${encoded}/latest`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.version ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve versions for a list of packages concurrently.
 * Returns a Map<packageName, version | null>.
 */
export async function resolveVersions(packages) {
  const results = await Promise.all(
    packages.map(async (pkg) => [pkg, await getLatestVersion(pkg)])
  );
  return new Map(results);
}

/**
 * Format a package with its resolved version for display.
 * Falls back to the plain package name if version lookup failed.
 */
export function formatPackageLabel(pkg, versionMap) {
  const version = versionMap.get(pkg);
  return version ? `${pkg}@${version}` : pkg;
}
