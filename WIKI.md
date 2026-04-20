
# 项目技术栈（Infra/后端为主）

## 1. 总体架构

- **站点静态资源（前端）**：GitHub Pages
- **后端 API**：Cloudflare Workers（`worker/src/index.ts`）
- **数据存储**：Cloudflare D1（SQLite）
- **鉴权**：Cloudflare Access（保护管理类页面/接口）
- **域名与 DNS**：Cloudflare（自定义域名解析、HTTPS、可选代理）

线上示例（仓库内已有文档引用）：

- 站点：`https://blog.aimmar.ink`
- API：`https://blog.aimmar.ink/api/*`

## 2. 域名（Cloudflare）

核心点：**域名在 Cloudflare 管理**，对外提供统一入口（站点与 API 可同域）。

- **DNS/HTTPS**：由 Cloudflare 负责证书与 HTTPS 终止（通常为 Universal SSL）
- **同域 API**：通过 Cloudflare Workers 路由将 `/api/*` 交给 Worker 处理（具体路由在 Cloudflare Dashboard 配置；仓库侧主要维护 Worker 代码与 `wrangler.toml`）

## 3. 后端（Cloudflare Workers）

- **Worker 项目目录**：`worker/`
- **入口**：`worker/src/index.ts`
- **部署工具**：Wrangler（见 `worker/package.json`）
  - `npm run dev` -> `wrangler dev`
  - `npm run deploy` -> `wrangler deploy`

Worker 运行时配置（绑定/变量）位于：

- `worker/wrangler.toml`

其中包括：

- **D1 绑定**：`[[d1_databases]] binding = "DB"`（数据库：`aimmar_blog`）
- **Access 相关变量**：`ACCESS_TEAM_DOMAIN` / `ACCESS_AUD`
- **管理员白名单**：`ADMIN_EMAIL`（以及代码侧支持的 `ADMIN_ALLOWED_SUBS`）

## 4. 存储（Cloudflare D1）

当前仓库可见的“后端存储”主要是 **D1**（未发现 R2/KV/DO 作为核心依赖）。

- **数据库**：`aimmar_blog`
- **绑定名**：`DB`
- **用途**：存储博客文章、TODO、persona 等（详见 `d1.md`）

相关文档/文件：

- `d1.md`
- `worker/schema.sql`
- `worker/seed.mjs` / `worker/seed.sql`

## 5. 鉴权（Cloudflare Access）

设计目标：读接口公开，写接口仅对本人或自动化 Agent 开放。

- **保护路径**（示例）：`/admin*`、`/stats*`、`/api/admin*`
- **Human（浏览器）**：Google 登录 + `ADMIN_EMAIL` 白名单
- **Agent（自动化）**：Service Token（请求头 `CF-Access-Client-Id` / `CF-Access-Client-Secret`）
- **Worker 侧**：读取 `Cf-Access-Jwt-Assertion` 并校验 JWT（详见 `worker/src/index.ts` 与 `worker/BLOG_API_README.md`）

详见：`worker/BLOG_API_README.md`

## 6. 部署（GitHub Pages）

本仓库的静态站点通过 **GitHub Pages** 托管，构建产物目录为：

- `dist/`

（构建由 `npm run build` 生成）

## 7. 发布机制（GitHub Actions / CI/CD）

工作流文件：

- `.github/workflows/deploy-pages.yml`

触发方式：

- `push` 到 `master` 或 `main`
- 手动触发 `workflow_dispatch`

核心流程（流水线概要）：

- **Checkout**：`actions/checkout@v4`
- **Node 环境**：`actions/setup-node@v4`（Node `20`，并启用 `npm` 缓存）
- **安装依赖**：`npm ci`
- **构建**：`npm run build`
- **上传 Pages Artifact**：`actions/upload-pages-artifact@v3`（`path: dist`）
- **部署到 Pages**：`actions/deploy-pages@v4`

补充：该工作流使用 `pages: write`、`id-token: write` 权限，并开启 `concurrency: pages` 避免并发部署冲突。

## 8. 关键索引（建议从这里看）

- **GitHub Pages CI/CD**：`.github/workflows/deploy-pages.yml`
- **Worker 入口**：`worker/src/index.ts`
- **Worker 配置（D1/vars）**：`worker/wrangler.toml`
- **后端 API 说明（鉴权/接口/curl）**：`worker/BLOG_API_README.md`
- **D1 使用与维护说明**：`d1.md`
