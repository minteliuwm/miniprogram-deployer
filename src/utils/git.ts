import { execSync } from 'child_process';
import type { GitInfo } from '../types';

/**
 * Collect git metadata from the current working directory.
 * Silently falls back to "unknown" when git is unavailable.
 */
export function getGitInfo(): GitInfo {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    const commit = execSync('git rev-parse --short HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    const commitMessage = execSync('git log -1 --pretty=%s', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    const dirty =
      execSync('git status --porcelain', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim().length > 0;

    return { branch, commit, commitMessage, dirty };
  } catch {
    return { branch: 'unknown', commit: 'unknown', commitMessage: 'unknown', dirty: false };
  }
}

/** Return the current UTC timestamp in ISO-8601 format. */
export function getBuildTime(): string {
  return new Date().toISOString();
}
