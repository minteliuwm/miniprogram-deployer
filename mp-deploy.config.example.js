/**
 * Example configuration for miniprogram-deployer
 * Copy this file to your project root and rename to mp-deploy.config.js
 */
module.exports = {
  // Mini program AppID (optional, will auto-read from project.config.json)
  appid: 'wx1234567890abcdef',

  // Path to your private key file (optional, will auto-detect in project root)
  // Download from: WeChat MP Admin → Development → Development Settings
  privateKeyPath: './private.wx.key',

  // Cloud Base environment ID (required for cloud function deployment)
  // Find in: WeChat DevTools → Cloud Base Console
  cloudEnv: 'your-cloud-env-id-xxx',
};
