import * as ci from 'miniprogram-ci';
import * as fs from 'fs';
import * as path from 'path';
import ora from 'ora';
import inquirer from 'inquirer';
import { loadConfig, resolveProjectPath, findPrivateKey } from '../utils/config';
import { getCurrentVersion, incrementVersion } from '../utils/version';
import { injectBuildInfo, cleanupBuildInfo } from '../utils/inject';
import { logger } from '../utils/logger';
import type { UploadOptions } from '../types';

/**
 * Upload the mini-program to the experience version.
 *
 * Supports interactive prompts for version / description and can
 * automatically bump the patch version number.
 */
export default async function upload(options: UploadOptions): Promise<void> {
  logger.divider();
  logger.step('Starting upload to experience version...');

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
    logger.info(
      'Download your private key from WeChat MP Admin Console → Development → Development Settings'
    );
    process.exit(1);
  }

  // Resolve version number.
  let version = options.version;
  if (options.autoVersion && !version) {
    version = incrementVersion(projectPath);
    logger.info(`Auto-incremented version: ${version}`);
  }
  if (!version) {
    version = getCurrentVersion(projectPath);
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Use version ${version}?`,
        default: true,
      },
    ]);
    if (!confirm) {
      const { inputVersion } = await inquirer.prompt([
        {
          type: 'input',
          name: 'inputVersion',
          message: 'Enter version:',
          default: version,
        },
      ]);
      version = inputVersion;
    }
  }

  // Resolve version description.
  let desc = options.desc;
  if (!desc) {
    const { inputDesc } = await inquirer.prompt([
      {
        type: 'input',
        name: 'inputDesc',
        message: 'Enter version description:',
        default: `Build at ${new Date().toLocaleString()}`,
      },
    ]);
    desc = inputDesc;
  }

  // Inject build info unless explicitly disabled.
  if (options.inject !== false) {
    const buildInfo = injectBuildInfo(projectPath);
    logger.info(
      `Build: ${buildInfo.commit} @ ${buildInfo.branch}${buildInfo.dirty ? ' (dirty)' : ''}`
    );
  }

  logger.info(`AppID: ${appid}`);
  logger.info(`Version: ${version}`);
  logger.info(`Description: ${desc}`);

  const project = new ci.Project({
    appid,
    type: 'miniProgram' as any,
    projectPath,
    privateKeyPath: path.resolve(privateKeyPath),
    ignores: ['node_modules/**/*', '.git/**/*', 'build-info.*'],
  });

  const spinner = ora('Uploading...').start();

  try {
    const uploadResult = await ci.upload({
      project,
      version: version!,
      desc,
      setting: {
        es6: true,
        minified: true,
      } as any,
      onProgressUpdate: (info: any) => {
        if (info._msg) spinner.text = info._msg;
      },
    });

    spinner.succeed('Upload completed!');
    logger.success(`Version ${version} uploaded successfully.`);

    if ((uploadResult as any).subPackageInfo) {
      logger.info(`Sub-packages uploaded: ${(uploadResult as any).subPackageInfo.length}`);
    }
  } catch (err: any) {
    spinner.fail('Upload failed');
    logger.error(err.message);
    process.exit(1);
  } finally {
    if (options.inject !== false) {
      cleanupBuildInfo(projectPath);
    }
  }

  logger.divider();
}
