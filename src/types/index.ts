/**
 * Shared type definitions for miniprogram-deployer.
 */

/** CLI options for the preview command. */
export interface PreviewOptions {
  config: string;
  project: string;
  key?: string;
  appid?: string;
  qrcode: string;
  page?: string;
  scene: string;
  inject: boolean;
  desc?: string;
}

/** CLI options for the upload command. */
export interface UploadOptions {
  config: string;
  project: string;
  key?: string;
  appid?: string;
  version?: string;
  desc?: string;
  autoVersion: boolean;
  inject: boolean;
}

/** CLI options for the cloud command. */
export interface CloudOptions {
  config: string;
  project: string;
  key?: string;
  appid?: string;
  env?: string;
  func?: string;
  publish: boolean;
}

/** Runtime configuration loaded from file or CLI flags. */
export interface DeployConfig {
  appid?: string;
  projectPath: string;
  privateKeyPath?: string;
  cloudEnv?: string;
}

/** Git metadata collected at build time. */
export interface GitInfo {
  branch: string;
  commit: string;
  commitMessage: string;
  dirty: boolean;
}

/** Build metadata injected into the mini-program. */
export interface BuildInfo extends GitInfo {
  buildTime: string;
}
