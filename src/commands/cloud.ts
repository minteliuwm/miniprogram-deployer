import * as ci from 'miniprogram-ci';
import * as fs from 'fs';
import * as path from 'path';
import ora from 'ora';
import { loadConfig, resolveProjectPath, findPrivateKey } from '../utils/config';
import { logger } from '../utils/logger';
import type { CloudOptions } from '../types';

/**
 * Upload and publish cloud functions.
 *
 * Scans the cloudfunctions directory (or the directory configured in
 * project.config.json) and deploys every function found, or a single
 * function when --func is specified.
 */
export default async function cloud(options: CloudOptions): Promise<void> {
  logger.divider();
  logger.step('Starting cloud function deployment...');

  const projectPath = resolveProjectPath(options.project);
  const config = loadConfig(options.config, projectPath);

  const appid = options.appid || config.appid;
  if (!appid) {
    logger.error('AppID is required. Use -a option or set it in project.config.json');
    process.exit(1);
  }

  const privateKeyPath = options.key || config.privateKeyPath || findPrivateKey(projectPath);
  if (!privateKeyPath || !fs.existsSync(privateKeyPath)) {
    logger.error('Private key not found. Use -k option or place it at project root.');
    process.exit(1);
  }

  // Resolve cloud environment ID.
  const env = options.env || config.cloudEnv;
  if (!env) {
    logger.error('Cloud environment ID is required. Use -e option or set it in config.');
    logger.info('Find your env ID in WeChat DevTools → Cloud Base Console');
    process.exit(1);
  }

  // Determine the cloud functions root directory.
  const projectConfigPath = path.join(projectPath, 'project.config.json');
  let cloudfunctionRoot = 'cloudfunctions';
  if (fs.existsSync(projectConfigPath)) {
    try {
      const pc = JSON.parse(fs.readFileSync(projectConfigPath, 'utf-8'));
      if (pc.cloudfunctionRoot) cloudfunctionRoot = pc.cloudfunctionRoot;
    } catch {
      /* ignore malformed JSON */
    }
  }
  const cloudBasePath = path.join(projectPath, cloudfunctionRoot);

  if (!fs.existsSync(cloudBasePath)) {
    logger.error(`Cloud functions directory not found: ${cloudBasePath}`);
    process.exit(1);
  }

  // Enumerate cloud function directories.
  const entries = fs.readdirSync(cloudBasePath, { withFileTypes: true });
  const funcDirs = entries
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name);

  if (funcDirs.length === 0) {
    logger.warn('No cloud functions found.');
    return;
  }

  // Filter by --func option.
  let targetFuncs = funcDirs;
  if (options.func) {
    if (!funcDirs.includes(options.func)) {
      logger.error(`Cloud function "${options.func}" not found.`);
      process.exit(1);
    }
    targetFuncs = [options.func];
  }

  logger.info(`Cloud environment: ${env}`);
  logger.info(`Cloud functions to deploy: ${targetFuncs.join(', ')}`);

  const project = new ci.Project({
    appid,
    type: 'miniProgram' as any,
    projectPath,
    privateKeyPath: path.resolve(privateKeyPath),
    ignores: ['node_modules/**/*', '.git/**/*'],
  });

  for (const funcName of targetFuncs) {
    const funcPath = path.join(cloudBasePath, funcName);
    const spinner = ora(`Deploying ${funcName}...`).start();

    try {
      await ci.cloud.uploadFunction({
        project,
        env,
        name: funcName,
        path: funcPath,
        remoteNpmInstall: true,
      });

      if (options.publish !== false) {
        // miniprogram-ci uploads and publishes in one call.
        spinner.succeed(`${funcName} uploaded & published.`);
      } else {
        spinner.succeed(`${funcName} uploaded (not published).`);
      }
    } catch (err: any) {
      spinner.fail(`${funcName} deployment failed`);
      logger.error(err.message);
    }
  }

  logger.divider();
}
