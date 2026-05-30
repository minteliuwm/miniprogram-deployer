import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';
import type { DeployConfig } from '../types';

/**
 * Load the deploy configuration from a JS config file or fall back
 * to values extracted from project.config.json.
 */
export function loadConfig(configPath: string, projectPath: string): DeployConfig {
  const resolvedPath = path.isAbsolute(configPath)
    ? configPath
    : path.join(process.cwd(), configPath);

  let config: Partial<DeployConfig> = {};

  if (fs.existsSync(resolvedPath)) {
    try {
      // Clear require cache so file changes are picked up in watch mode.
      delete require.cache[require.resolve(resolvedPath)];
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      config = require(resolvedPath) as Partial<DeployConfig>;
    } catch (e: any) {
      logger.warn(`Failed to load config file: ${e.message}`);
    }
  }

  // Attempt to read appid from project.config.json.
  const projectConfigPath = path.join(projectPath, 'project.config.json');
  let appid: string | undefined;
  if (fs.existsSync(projectConfigPath)) {
    try {
      const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf-8'));
      appid = projectConfig.appid;
    } catch {
      /* ignore malformed JSON */
    }
  }

  return {
    appid,
    projectPath: path.resolve(projectPath),
    ...config,
  };
}

/** Resolve the absolute path of the mini-program project. */
export function resolveProjectPath(inputPath?: string): string {
  return path.resolve(inputPath || '.');
}

/**
 * Search common locations for the WeChat private key file.
 * Returns the first existing path, or null if none found.
 */
export function findPrivateKey(projectPath: string): string | null {
  const candidates = [
    path.join(projectPath, 'private.key'),
    path.join(projectPath, 'private.wx.key'),
    path.join(projectPath, 'key/private.key'),
    path.join(process.cwd(), 'private.key'),
    path.join(process.cwd(), 'private.wx.key'),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}
