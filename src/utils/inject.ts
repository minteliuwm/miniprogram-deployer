import * as fs from 'fs';
import * as path from 'path';
import { getGitInfo, getBuildTime } from './git';
import { logger } from './logger';
import type { BuildInfo } from '../types';

const BUILD_INFO_PLACEHOLDER = '/* BUILD_INFO_INJECT */';
const BUILD_INFO_COMMENT = '// Auto-generated build info - do not edit manually\n';

/** Assemble build metadata from git and the current timestamp. */
export function generateBuildInfo(): BuildInfo {
  const git = getGitInfo();
  return {
    branch: git.branch,
    commit: git.commit,
    commitMessage: git.commitMessage,
    dirty: git.dirty,
    buildTime: getBuildTime(),
  };
}

/**
 * Inject build metadata into the mini-program project.
 *
 * - Writes build-info.js and build-info.json at the project root.
 * - If app.js contains the placeholder, injects a build variable there as well.
 *
 * Returns the generated BuildInfo object.
 */
export function injectBuildInfo(
  projectPath: string,
  options: { injectAppJs?: boolean } = {}
): BuildInfo {
  const info = generateBuildInfo();
  const infoJson = JSON.stringify(info, null, 2);

  // Strategy 1: dedicated JS module.
  const buildInfoPath = path.join(projectPath, 'build-info.js');
  const buildInfoContent = `${BUILD_INFO_COMMENT}module.exports = ${infoJson};\n`;
  fs.writeFileSync(buildInfoPath, buildInfoContent);
  logger.success('Build info written to build-info.js');

  // Strategy 2: inject into app.js when the placeholder is present.
  const appJsPath = path.join(projectPath, 'app.js');
  if (fs.existsSync(appJsPath) && options.injectAppJs !== false) {
    let appJs = fs.readFileSync(appJsPath, 'utf-8');
    if (appJs.includes(BUILD_INFO_PLACEHOLDER)) {
      const injection = `${BUILD_INFO_COMMENT}const __BUILD_INFO__ = ${infoJson};\n`;
      appJs = appJs.replace(BUILD_INFO_PLACEHOLDER, injection + BUILD_INFO_PLACEHOLDER);
      fs.writeFileSync(appJsPath, appJs);
      logger.success('Build info injected into app.js');
    }
  }

  // Strategy 3: JSON file for WXML / WXSS reference.
  const buildInfoJsonPath = path.join(projectPath, 'build-info.json');
  fs.writeFileSync(buildInfoJsonPath, infoJson + '\n');

  return info;
}

/** Remove the temporary build-info files created during the deploy pipeline. */
export function cleanupBuildInfo(projectPath: string): void {
  const files = ['build-info.js', 'build-info.json'];
  for (const f of files) {
    const p = path.join(projectPath, f);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
    }
  }
}
