# miniprogram-deployer

> A TypeScript-based CLI tool for deploying WeChat Mini Programs, supporting preview, experience version upload, and cloud function publishing.

## Features

- **Preview**: Generate preview QR codes for quick team sharing
- **Upload**: One-click upload to experience version with auto version increment
- **Cloud**: Batch upload and publish cloud functions
- **Automation**:
  - Git info injection (branch, commit, commit message)
  - Build timestamp injection
  - Auto version bumping
  - Interactive CLI prompts

## Installation

### Global

```bash
npm install -g miniprogram-deployer
```

### Local (Recommended)

```bash
npm install -D miniprogram-deployer
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "preview": "mp-deploy preview",
    "upload": "mp-deploy upload",
    "cloud": "mp-deploy cloud"
  }
}
```

## Quick Start

### 1. Get Your Private Key

Log in to [WeChat MP Admin](https://mp.weixin.qq.com/) → Development → Development Settings → Mini Program Code Upload, download the private key file (`private.xxx.key`), and place it in your project root.

### 2. Run Commands

```bash
# Preview
mp-deploy preview

# Upload to experience version (interactive)
mp-deploy upload

# Upload with auto version bump
mp-deploy upload --auto-version

# Publish cloud functions
mp-deploy cloud -e your-env-id
```

## Commands

### `mp-deploy preview`

| Option          | Description                  | Default                       |
| --------------- | ---------------------------- | ----------------------------- |
| `-c, --config`  | Config file path             | `mp-deploy.config.js`         |
| `-p, --project` | Mini program project path    | `.`                           |
| `-k, --key`     | Private key path             | Auto-detect                   |
| `-a, --appid`   | Mini program AppID           | Read from project.config.json |
| `-q, --qrcode`  | QR code output path          | `./preview.jpg`               |
| `--page`        | Preview page path            | -                             |
| `--scene`       | Scene value                  | `1011`                        |
| `--no-inject`   | Disable build info injection | -                             |

### `mp-deploy upload`

| Option           | Description                  | Default                       |
| ---------------- | ---------------------------- | ----------------------------- |
| `-c, --config`   | Config file path             | `mp-deploy.config.js`         |
| `-p, --project`  | Mini program project path    | `.`                           |
| `-k, --key`      | Private key path             | Auto-detect                   |
| `-a, --appid`    | Mini program AppID           | Read from project.config.json |
| `-v, --version`  | Version number               | Read from package.json        |
| `-d, --desc`     | Version description          | Interactive input             |
| `--auto-version` | Auto-increment patch version | -                             |
| `--no-inject`    | Disable build info injection | -                             |

### `mp-deploy cloud`

| Option          | Description                  | Default                       |
| --------------- | ---------------------------- | ----------------------------- |
| `-c, --config`  | Config file path             | `mp-deploy.config.js`         |
| `-p, --project` | Mini program project path    | `.`                           |
| `-k, --key`     | Private key path             | Auto-detect                   |
| `-a, --appid`   | Mini program AppID           | Read from project.config.json |
| `-e, --env`     | Cloud environment ID         | -                             |
| `-f, --func`    | Specific cloud function name | All                           |
| `--no-publish`  | Upload only, do not publish  | -                             |

## Configuration

Create `mp-deploy.config.js` in your project root:

```js
module.exports = {
  // Mini program AppID (optional, auto-read from project.config.json)
  appid: 'wx1234567890abcdef',

  // Private key path (optional, auto-detected)
  // Download from: WeChat MP Admin → Development → Development Settings
  privateKeyPath: './private.wx.key',

  // Cloud environment ID (required for cloud function deployment)
  // Find in: WeChat DevTools → Cloud Base Console
  cloudEnv: 'your-cloud-env-id-xxx',
};
```

## Build Info Injection

The tool automatically injects build metadata into your mini program:

- `build-info.js` / `build-info.json`: Complete build information
- If `app.js` contains `/* BUILD_INFO_INJECT */` placeholder, build variables are injected automatically

Example injected content:

```js
const __BUILD_INFO__ = {
  branch: 'main',
  commit: 'a1b2c3d',
  commitMessage: 'feat: add new feature',
  dirty: false,
  buildTime: '2024-01-15T08:30:00.000Z',
};
```

Reference in your mini program:

```js
// app.js
const buildInfo = require('./build-info.js');
App({
  onLaunch() {
    console.log('Build:', buildInfo.commit, buildInfo.buildTime);
  },
});
```

## Requirements

- Node.js >= 16
- TypeScript >= 5.0 (for development build)
- WeChat Mini Program admin access (for downloading private key)

## License

MIT
