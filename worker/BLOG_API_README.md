
# Blog API（Cloudflare Worker + D1）

该文档描述本仓库的博客后端：使用 Cloudflare Worker 提供 API、Cloudflare D1 存储文章数据，并通过 Cloudflare Access 对管理类接口做鉴权。

目标：

- 读接口公开（无需登录）
- 写接口（新增/更新/删除）仅对本人或自动化 Agent 开放
- 支持浏览器（Human）与机器（Service Token）两种鉴权方式

---

## 1. 架构总览

- **前端**：GitHub Pages / 自定义域名部署，路由为 SPA
- **后端**：Cloudflare Worker（`worker/src/index.ts`）
- **数据**：Cloudflare D1（SQLite）
- **鉴权**：Cloudflare Access
  - Human：Google 登录 + 邮箱白名单
  - Agent：Service Token（`CF-Access-Client-Id` / `CF-Access-Client-Secret`）

线上域名（示例）：

- 站点：`https://blog.aimmar.ink`
- API：`https://blog.aimmar.ink/api/*`

---

## 2. 数据模型（Post）

Post 的字段与前端 `src/data/posts.json` 保持一致：

- `title`
- `titleZh`
- `excerpt`
- `excerptZh`
- `date`
- `category`
- `categoryZh`
- `slug`（唯一键）
- `readTime`
- `content`
- `contentZh`

---

## 3. API 列表

### 3.1 公开读接口（无需登录）

#### `GET /api/posts`

返回全部文章（按 rowid 倒序）。

```bash
curl -s https://blog.aimmar.ink/api/posts
```

#### `GET /api/posts/:slug`

按 `slug` 获取单篇文章。

```bash
curl -s https://blog.aimmar.ink/api/posts/agent-test
```

#### `GET /api/search?q=xxx`

简单全文搜索（LIKE 匹配 title/excerpt/content 及其中英文）。

```bash
curl -s 'https://blog.aimmar.ink/api/search?q=context'
```

---

### 3.2 管理写接口（需要 Cloudflare Access）

所有管理接口路径为：`/api/admin/*`

#### `GET /api/admin/whoami`

用于调试鉴权身份。

```bash
curl -s https://blog.aimmar.ink/api/admin/whoami \
  -H "CF-Access-Client-Id: <client-id>" \
  -H "CF-Access-Client-Secret: <client-secret>"
```

返回示例：

```json
{"ok":true,"email":null,"sub":"","commonName":"<service-token-client-id>"}
```

说明：

- Human 登录时通常能拿到 `email`
- Service Token 场景下 `sub` 可能为空，此时以 `commonName` 作为机器身份（常等于 `CF-Access-Client-Id`）

#### `PUT /api/admin/posts`

批量 upsert（全量覆盖/同步）。Body 为 Post 数组。

```bash
curl -i https://blog.aimmar.ink/api/admin/posts \
  -H "content-type: application/json" \
  -H "CF-Access-Client-Id: <client-id>" \
  -H "CF-Access-Client-Secret: <client-secret>" \
  --data '[]'
```

#### `POST /api/admin/post`

单篇 upsert（推荐给 Agent：避免全量覆盖）。Body 为单个 Post。

```bash
curl -i https://blog.aimmar.ink/api/admin/post \
  -H "content-type: application/json" \
  -H "CF-Access-Client-Id: <client-id>" \
  -H "CF-Access-Client-Secret: <client-secret>" \
  --data '{
    "title":"agent test",
    "titleZh":"agent test",
    "excerpt":"",
    "excerptZh":"",
    "date":"2026-01-21",
    "category":"test",
    "categoryZh":"测试",
    "slug":"agent-test",
    "readTime":"1 min",
    "content":"hello",
    "contentZh":"hello"
  }'
```

#### `DELETE /api/admin/posts/:slug`

删除指定 slug。

```bash
curl -i -X DELETE https://blog.aimmar.ink/api/admin/posts/agent-test \
  -H "CF-Access-Client-Id: <client-id>" \
  -H "CF-Access-Client-Secret: <client-secret>"
```

---

## 4. Cloudflare Access 鉴权设计

### 4.1 为什么要 Access

- 前端部署在 GitHub Pages，不能安全存储管理密钥
- 写接口必须限制访问者
- 需要同时支持：
  - 浏览器登录（本人）
  - 机器发布（Agent）

### 4.2 Human（浏览器）

思路：

- Cloudflare Access 保护 `https://blog.aimmar.ink/admin*`、`/stats*`、`/api/admin*`
- Policy（Allow）使用 Google 登录，并限制 `email == ADMIN_EMAIL`
- 访问受保护页面时，Access 会在边缘注入 `Cf-Access-Jwt-Assertion` 给 Worker

### 4.3 Agent（Service Token）

关键点：

- Service Token 的 policy **必须使用 `Service Auth`**（不是 Allow），否则常出现 302 跳转登录页
- Agent 通过请求头携带：
  - `CF-Access-Client-Id`
  - `CF-Access-Client-Secret`

Worker 侧会验证：

- JWT 签名（Access certs）
- `aud` 是否匹配 Access Application 的 AUD
- 过期时间 `exp`

然后再做写权限控制：

- Human：`payload.email == ADMIN_EMAIL`
- Agent：`payload.sub || payload.common_name` 命中 `ADMIN_ALLOWED_SUBS`

---

## 5. Worker 环境变量

Worker（运行时）环境变量：

- `ADMIN_EMAIL`：本人邮箱（Human 鉴权白名单）
- `ADMIN_ALLOWED_SUBS`：Agent 身份白名单（逗号分隔）
  - 推荐填 `whoami` 返回的 `commonName`
- `ACCESS_TEAM_DOMAIN`：例如 `aimmar.cloudflareaccess.com`
- `ACCESS_AUD`：Access Application 的 AUD

---

## 6. 本地/远程 D1 初始化与导入

### 6.1 初始化 schema

```bash
npx wrangler d1 execute aimmar_blog --remote --file=./schema.sql
```

### 6.2 从仓库 posts.json 生成 seed.sql 并导入

```bash
npm run seed:sql
npx wrangler d1 execute aimmar_blog --remote --file=./seed.sql
```

---

## 7. 给 Gemini CLI / 其他 Agent 的接入说明

### 7.1 推荐方式：把本文档作为“项目技能/约束”喂给 Agent

对 `gemini-cli` 这类工具，一般不需要 MCP 服务器：

- **Skill/Project instruction** 更轻量：
  - 把本 README（或其关键片段：鉴权方式 + 接口 curl 示例 + 数据模型）放进项目上下文
  - Agent 直接按 curl 或 HTTP client 调用

MCP 更适合：

- 你希望把“发布文章”封装成一个稳定工具函数（例如 `publish_post()`）
- 或者需要更复杂的能力（批量同步、自动生成 slug、冲突处理策略等）

当前阶段：**先用本文档作为 skill 最快**。

### 7.2 Agent 运行时需要的密钥

Agent 需要两项机密（来自 Cloudflare Access 的 Service Token）：

- `CF_ACCESS_CLIENT_ID`
    331397ba10ecaed35a9c731d9b29f3fa.access

- `CF_ACCESS_CLIENT_SECRET`
    f66491b550629fb4615b07e6e0ed5707010d6ef2a35c44ad66b23af548cf26a4

建议存放：

- 本地：环境变量 / 密码管理器 / `.env`（不要提交 git）
- CI：GitHub Actions Secrets（如需自动化发布）

### 7.3 Agent 发布文章的最小流程

1) 构造 Post JSON（确保 `slug` 唯一）

2) 调用单篇 upsert：

```bash
curl -s https://blog.aimmar.ink/api/admin/post \
  -H "content-type: application/json" \
  -H "CF-Access-Client-Id: $CF_ACCESS_CLIENT_ID" \
  -H "CF-Access-Client-Secret: $CF_ACCESS_CLIENT_SECRET" \
  --data @post.json
```

3)（可选）验证结果：

```bash
curl -s https://blog.aimmar.ink/api/posts/<slug>
```

---

## 8. 常见排错

### 8.1 `curl` 一直 302 跳登录页

- 检查 Access policy：Service Token 必须是 **Service Auth**
- 检查 Access Application 的 domain/path 是否覆盖 `/api/admin/*`

### 8.2 `whoami` 200 但 `sub` 为空

- 正常现象：Service Token JWT 可能 `sub` 为空
- 以 `commonName`（通常等于 `CF-Access-Client-Id`）作为机器身份

### 8.3 写接口 401 / forbidden

- 检查 Worker 变量 `ADMIN_ALLOWED_SUBS` 是否包含 `commonName`
- 用 `GET /api/admin/whoami` 确认当前 identity

---

## 9. 安全与轮换建议

- Service Token Secret 只会在创建时显示一次，务必安全保存
- 定期轮换：
  - 新建一个 Service Token
  - 把新 `client id` 加入 `ADMIN_ALLOWED_SUBS`
  - 更新 Agent/CI 的 secret
  - 删除旧 token，并从白名单移除

