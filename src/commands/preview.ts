import * as ci from 'miniprogram-ci';
import * as fs from 'fs';
import * as path from 'path';
import ora from 'ora';
import { loadConfig, resolveProjectPath, findPrivateKey } from '../utils/config';
import { getCurrentVersion } from '../utils/version';
import { injectBuildInfo, cleanupBuildInfo } from '../utils/inject';
import { logger } from '../utils/logger';
import type { PreviewOptions } from '../types';

/**
 * Generate a preview QR code for the mini-program.
 *
 * This command injects build metadata, uploads the project via
 * miniprogram-ci, and writes the resulting QR image to disk.
 */
export default async function preview(options: PreviewOptions): Promise<void> {
  logger.divider();
  logger.step('Starting preview...');

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

  // Inject build info unless explicitly disabled.
  if (options.inject !== false) {
    const buildInfo = injectBuildInfo(projectPath);
    logger.info(
      `Build: ${buildInfo.commit} @ ${buildInfo.branch}${buildInfo.dirty ? ' (dirty)' : ''}`
    );
  }

  const version = getCurrentVersion(projectPath);
  const qrcodePath = path.resolve(options.qrcode);

  const project = new ci.Project({
    appid,
    type: 'miniProgram' as any,
    projectPath,
    privateKeyPath: path.resolve(privateKeyPath),
    ignores: ['node_modules/**/*', '.git/**/*', 'build-info.*'],
  });

  const spinner = ora('Generating preview QR code...').start();

  try {
    const previewResult = await ci.preview({
      project,
      version,
      desc: options.desc || `Preview from ${new Date().toLocaleString()}`,
      setting: {
        es6: true,
        minified: true,
      } as any,
      qrcodeFormat: 'image',
      qrcodeOutputDest: qrcodePath,
      pagePath: options.page,
      scene: parseInt(options.scene, 10) || 1011,
    });

    spinner.succeed('Preview generated successfully!');
    logger.success(`QR Code saved to: ${qrcodePath}`);

    if ((previewResult as any).subPackageInfo) {
      logger.info(`Sub-packages: ${(previewResult as any).subPackageInfo.length}`);
    }
  } catch (err: any) {
    spinner.fail('Preview failed');
    logger.error(err.message);
    process.exit(1);
  } finally {
    if (options.inject !== false) {
      cleanupBuildInfo(projectPath);
    }
  }

  logger.divider();
}
