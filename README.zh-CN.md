# miniprogram-deployer

> 一个基于 TypeScript 的 CLI 工具，用于微信小程序的部署工作流，包括预览、体验版上传和云函数发布。

## 功能特性

- **预览 (preview)**：生成预览二维码，快速分享给团队成员
- **上传体验版 (upload)**：一键上传代码到体验版，支持版本号自动递增
- **云函数发布 (cloud)**：批量上传并发布云函数
- **自动化增强**：
  - Git 信息注入（分支、commit、提交信息）
  - 构建时间注入
  - 版本号自动递增
  - 交互式命令行提示

## 安装

### 全局安装

```bash
npm install -g miniprogram-deployer
```

### 项目内安装（推荐）

```bash
npm install -D miniprogram-deployer
```

然后在 `package.json` 中添加 scripts：

```json
{
  "scripts": {
    "preview": "mp-deploy preview",
    "upload": "mp-deploy upload",
    "cloud": "mp-deploy cloud"
  }
}
```

## 快速开始

### 1. 获取私钥

登录[微信小程序管理后台](https://mp.weixin.qq.com/) → 开发 → 开发设置 → 小程序代码上传，下载私钥文件（`private.xxx.key`），放到项目根目录。

### 2. 使用命令

```bash
# 预览
mp-deploy preview

# 上传体验版（交互式）
mp-deploy upload

# 上传体验版（自动版本号）
mp-deploy upload --auto-version

# 发布云函数
mp-deploy cloud -e your-env-id
```

## 命令详解

### `mp-deploy preview` — 预览

| 选项            | 说明             | 默认值                   |
| --------------- | ---------------- | ------------------------ |
| `-c, --config`  | 配置文件路径     | `mp-deploy.config.js`    |
| `-p, --project` | 小程序项目路径   | `.`                      |
| `-k, --key`     | 私钥路径         | 自动查找                 |
| `-a, --appid`   | 小程序 AppID     | 读取 project.config.json |
| `-q, --qrcode`  | 二维码保存路径   | `./preview.jpg`          |
| `--page`        | 指定预览页面     | -                        |
| `--scene`       | 指定场景值       | `1011`                   |
| `--no-inject`   | 禁用构建信息注入 | -                        |

### `mp-deploy upload` — 上传体验版

| 选项             | 说明                  | 默认值                   |
| ---------------- | --------------------- | ------------------------ |
| `-c, --config`   | 配置文件路径          | `mp-deploy.config.js`    |
| `-p, --project`  | 小程序项目路径        | `.`                      |
| `-k, --key`      | 私钥路径              | 自动查找                 |
| `-a, --appid`    | 小程序 AppID          | 读取 project.config.json |
| `-v, --version`  | 指定版本号            | 读取 package.json        |
| `-d, --desc`     | 版本描述              | 交互式输入               |
| `--auto-version` | 自动递增 patch 版本号 | -                        |
| `--no-inject`    | 禁用构建信息注入      | -                        |

### `mp-deploy cloud` — 发布云函数

| 选项            | 说明           | 默认值                   |
| --------------- | -------------- | ------------------------ |
| `-c, --config`  | 配置文件路径   | `mp-deploy.config.js`    |
| `-p, --project` | 小程序项目路径 | `.`                      |
| `-k, --key`     | 私钥路径       | 自动查找                 |
| `-a, --appid`   | 小程序 AppID   | 读取 project.config.json |
| `-e, --env`     | 云开发环境 ID  | -                        |
| `-f, --func`    | 指定单个云函数 | 全部                     |
| `--no-publish`  | 仅上传不发布   | -                        |

## 配置文件

在项目根目录创建 `mp-deploy.config.js`：

```js
module.exports = {
  // 小程序 AppID（可选，会自动读取 project.config.json）
  appid: 'wx1234567890abcdef',

  // 私钥路径（可选，会自动查找）
  privateKeyPath: './private.wx.key',

  // 云开发环境 ID
  cloudEnv: 'your-cloud-env-id',
};
```

## 构建信息注入

工具会自动将以下信息注入到小程序项目中：

- `build-info.js` / `build-info.json`：包含完整的构建信息
- 如果 `app.js` 中包含 `/* BUILD_INFO_INJECT */` 占位符，会自动注入构建变量

注入的内容示例：

```js
const __BUILD_INFO__ = {
  branch: 'main',
  commit: 'a1b2c3d',
  commitMessage: 'feat: add new feature',
  dirty: false,
  buildTime: '2024-01-15T08:30:00.000Z',
};
```

你可以在小程序代码中引用：

```js
// app.js
const buildInfo = require('./build-info.js');
App({
  onLaunch() {
    console.log('Build:', buildInfo.commit, buildInfo.buildTime);
  },
});
```

## 环境要求

- Node.js >= 16
- TypeScript >= 5.0（开发构建时）
- 微信小程序管理员权限（用于下载私钥）

## 开源协议

MIT
