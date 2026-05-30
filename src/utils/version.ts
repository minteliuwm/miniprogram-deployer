import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';

/**
 * Read the current version from the project's package.json.
 * Falls back to "1.0.0" when no package.json exists.
 */
export function getCurrentVersion(projectPath: string): string {
  const pkgPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (pkg.version) return pkg.version;
  }
  return '1.0.0';
}

/**
 * Bump the patch version in the project's package.json.
 * Returns the new version string.
 */
export function incrementVersion(projectPath: string): string {
  const current = getCurrentVersion(projectPath);
  const next = semver.inc(current, 'patch');
  if (!next) return current;

  const pkgPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.version = next;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }

  return next;
}
