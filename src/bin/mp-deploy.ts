#!/usr/bin/env node

import { program } from 'commander';
import * as pkg from '../../package.json';
import preview from '../commands/preview';
import upload from '../commands/upload';
import cloud from '../commands/cloud';

program
  .name('mp-deploy')
  .description('CLI tool for deploying WeChat Mini Program')
  .version(pkg.version);

program
  .command('preview')
  .description('Generate preview QR code')
  .option('-c, --config <path>', 'config file path', 'mp-deploy.config.js')
  .option('-p, --project <path>', 'mini program project path', '.')
  .option('-k, --key <path>', 'private key path')
  .option('-a, --appid <id>', 'mini program appid')
  .option('-q, --qrcode <path>', 'qrcode output path', './preview.jpg')
  .option('--page <path>', 'preview page path')
  .option('--scene <scene>', 'preview scene', '1011')
  .option('--no-inject', 'disable build info injection')
  .action(preview);

program
  .command('upload')
  .description('Upload to experience version')
  .option('-c, --config <path>', 'config file path', 'mp-deploy.config.js')
  .option('-p, --project <path>', 'mini program project path', '.')
  .option('-k, --key <path>', 'private key path')
  .option('-a, --appid <id>', 'mini program appid')
  .option('-v, --version <version>', 'upload version')
  .option('-d, --desc <desc>', 'version description')
  .option('--auto-version', 'auto increment version number')
  .option('--no-inject', 'disable build info injection')
  .action(upload);

program
  .command('cloud')
  .description('Upload and publish cloud functions')
  .option('-c, --config <path>', 'config file path', 'mp-deploy.config.js')
  .option('-p, --project <path>', 'mini program project path', '.')
  .option('-k, --key <path>', 'private key path')
  .option('-a, --appid <id>', 'mini program appid')
  .option('-e, --env <env>', 'cloud environment id')
  .option('-f, --func <name>', 'specific cloud function name to deploy')
  .option('--no-publish', 'upload only, do not publish')
  .action(cloud);

program.parse();
