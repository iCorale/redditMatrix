# Reddit Matrix

一个以瀑布流图片墙形式浏览 Reddit 图片版块（subreddit）的应用，同时支持 Web（GitHub Pages）和原生移动端（iOS / Android via Capacitor）。

---

## 目录

- [功能特性](#功能特性)
- [项目架构](#项目架构)
- [技术栈](#技术栈)
- [本地开发](#本地开发)
- [部署到 GitHub Pages](#部署到-github-pages)
- [原生移动端构建](#原生移动端构建)
- [注意事项](#注意事项)

---

## 功能特性

| 功能 | 说明 |
|------|------|
| **图片瀑布流** | 使用 `@appnest/masonry-layout` 实现自适应多列瀑布流布局 |
| **五种排序** | Best / Hot / New / Top / Rising，切换时自动重载；点击已选中的 Tab 触发刷新；排序偏好通过 `localStorage` 按版块持久化 |
| **Lightbox 全屏预览** | 点击图片全屏显示原始分辨率；支持键盘左右切换；点击外部或按 Esc 关闭 |
| **Lightbox 图片缩放** | 点击图片放大至自然分辨率并定位到点击区域（仿 Reddit 交互）；支持原生滚动平移；再次点击或按 Esc 缩小；全屏模糊背景 |
| **Lightbox 内无限预加载** | 浏览至距末尾 3 张时自动后台加载下一批，无需退出 Lightbox；最后一张时右箭头变为 loading spinner |
| **关闭 Lightbox 自动定位** | 关闭后页面平滑滚动至最后查看的图片并高亮轮廓；距离近时 ease-in-out 缓动，距离远时瞬间跳转 + 轮廓环闪烁 |
| **Redgifs 内容支持** | 识别 `redgifs.com` 链接，瀑布流展示缩略图（标注播放图标），Lightbox 内通过 iframe 嵌入播放 |
| **多图 Gallery 支持** | Reddit 多图帖子展开为独立卡片，Lightbox 内可左右切换 |
| **无限滚动加载** | 滚动到底部自动加载下一页（`svelte-infinite-loading`）；去重保护防止分页重叠 |
| **滚动快捷按钮** | 浮动按钮根据滚动方向显示"到顶部"或"到底部"箭头 |
| **版块搜索** | 支持在指定 subreddit 内关键词搜索 |
| **版块收藏列表** | 首页维护自定义版块列表，支持长按选择批量操作 |
| **模糊搜索** | 版块名称模糊补全，由 Rust 编译的 WASM 模块提供，运行在 Web Worker 中 |
| **PWA 安装支持** | 可安装到桌面/手机主屏幕（通过 Web App Manifest，无 Service Worker） |
| **Cloudflare Worker 代理** | API 请求通过 Worker 转发，支持 OAuth 认证和 cookie 回退 |
| **深色/浅色主题** | 自动跟随系统 `prefers-color-scheme` |
| **原生移动端** | 通过 Capacitor 封装为 iOS / Android 应用 |

---

## 项目架构

```
redditMatrix/
├── src/
│   ├── pages/                   # @roxi/routify 文件路由
│   │   ├── index.svelte         # 首页：版块列表管理
│   │   ├── settings.svelte      # 设置页
│   │   ├── _layout.svelte       # 全局布局（Cookie 对话框快捷键入口）
│   │   ├── _fallback.svelte     # 404 页面
│   │   └── r/
│   │       └── [subreddit].svelte  # 子版块图片墙页面（核心页面）
│   │
│   ├── components/
│   │   ├── Card.svelte          # 单张图片卡片（含长按选择、播放角标）
│   │   ├── Grid.svelte          # 瀑布流网格，集成 Lightbox 与预加载逻辑
│   │   ├── Lightbox.svelte      # 全屏大图预览（缩放/平移/Redgifs iframe）
│   │   ├── CookieDialog.svelte  # Reddit Cookie 填写对话框（隐藏入口）
│   │   ├── ScrollButton.svelte  # 浮动滚动快捷按钮（顶部/底部）
│   │   ├── List.svelte          # 版块列表项
│   │   ├── CancellableList.svelte
│   │   ├── Results.svelte       # 搜索结果展示
│   │   └── navbar/
│   │       ├── HomeNav.svelte       # 首页导航栏
│   │       ├── SubredditNav.svelte  # 子版块导航栏（含排序 Tabs）
│   │       ├── InputNav.svelte      # 搜索输入导航栏
│   │       └── SelectionNav.svelte  # 多选操作导航栏
│   │
│   ├── store/
│   │   └── app.ts               # 全局 Svelte Store（posts, mode, sort, query, refreshSignal）
│   │
│   ├── utils/
│   │   ├── api.ts               # Reddit API 请求（通过 Worker 代理）
│   │   ├── cookieStore.ts       # localStorage Cookie 持久化
│   │   ├── actions.ts           # 自定义 Svelte Action（longpress）
│   │   └── TabsTransition.svelte
│   │
│   ├── App.svelte               # 应用根组件（Routify 路由入口）
│   ├── main.ts                  # 应用挂载入口
│   ├── global.scss              # 全局样式 + CSS 自定义属性（主题变量）
│   └── variables.scss           # SCSS 变量定义
│
├── fuzzy_complete/              # Rust crate，编译为 WASM
│   └── src/lib.rs               # 模糊搜索逻辑（wasm-bindgen）
│
├── worker/                      # Cloudflare Worker（API 代理 + 认证）
│   └── index.ts                 # OAuth token 缓存 / Cookie 转发逻辑
│
├── assets/                      # 静态资源（图标、Web App Manifest 等）
├── vite.config.ts               # Vite 构建配置
├── wrangler.toml                # Wrangler（Cloudflare Worker）配置
├── tsconfig.json                # TypeScript 配置
├── capacitor.config.json        # Capacitor 原生配置
├── deploy.sh                    # GitHub Pages 一键部署脚本
└── package.json
```

### 数据流

```
用户访问 /r/[subreddit]
    │
    ▼
[subreddit].svelte
    │  调用 fetchNextPage() → getPosts(subreddit, query, after, sort)
    ▼
src/utils/api.ts  ── redditGet()
    │
    │  所有请求统一通过 Worker 代理：
    │  ├── 本地开发： Vite proxy → local wrangler dev (:8787)
    │  └── 公网部署： 直接 fetch Worker URL
    │
    ▼
Cloudflare Worker ── worker/index.ts
    │
    ├── 有 X-Reddit-Cookie 头？ → cookie 模式（转发到 reddit.com）
    └── 有 OAuth 凭证？        → OAuth 模式（匿名 token → oauth.reddit.com）
    │
    ▼
Reddit API → JSON 响应
    │
    ▼
extractPosts()
    ├── 普通帖子   → 返回 1 个 Post { id, title, url, fullUrl? }
    ├── Gallery   → 展开为 N 个 Post（每张图独立卡片）
    └── Redgifs   → 返回 Post { url（缩略图）, embedUrl（iframe src）}
    │
    ▼
posts[] store
    │
    ▼
Grid.svelte → Card.svelte × N
    │              │ on:view（打开 Lightbox）
    │              │ on:needMore（Lightbox 接近末尾，触发后台预加载）
    ▼              ▼
svelte-infinite-loading    Lightbox.svelte
（滚动触发加载）              ├── 图片：fullUrl → url fallback
                             ├── Redgifs：<iframe embedUrl>
                             └── 关闭 → Grid.closeLightbox()
                                          → 平滑滚动 + 轮廓高亮定位
```

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Svelte | ^4.2 |
| 构建工具 | Vite | ^5.4 |
| 语言 | TypeScript | ^5.8 |
| 路由 | @roxi/routify | ^2.18 |
| UI 组件 | Material Web Components (MWC) | ^0.25 |
| 图标 | unplugin-icons + @iconify-json/mdi | — |
| 样式 | Sass/SCSS (modern-compiler API) | ^1.99 |
| 瀑布流 | @appnest/masonry-layout | ^2.0 |
| 无限滚动 | svelte-infinite-loading | ^1.4 |
| 模糊搜索 | Rust → WASM (wasm-pack) + Comlink Web Worker | — |
| 后端代理 | Cloudflare Worker + Wrangler | ^4.x |
| 原生移动端 | Capacitor | ^3.2 |

---

## 本地开发

### 环境准备

- Node.js ≥ 18
- pnpm ≥ 9
- Rust + wasm-pack（模糊搜索 WASM 模块需要）
- Wrangler CLI（Cloudflare Worker 需要）

```bash
# 安装 wasm-pack（如未安装）
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 安装 Wrangler（如未安装）
pnpm add -g wrangler
```

### 步骤

```bash
# 1. 安装依赖
pnpm install

# 2. 编译 Rust WASM 模块（仅首次或修改 fuzzy_complete 后需要）
wasm-pack build ./fuzzy_complete --target web

# 3. 启动 Worker 代理（终端 1）
npx wrangler dev --port 8787

# 4. 启动开发服务器（终端 2）
pnpm dev:start
```

开发服务器运行于 `http://localhost:5173`，Worker 本地代理运行于 `http://localhost:8787`。

### 本地 Cookie 配置

本地开发有三种方式配置 Reddit 认证：

**方式 1：`.dev.vars` 文件（推荐）**

```bash
# 1. 浏览器登录 Reddit，F12 → Application → Cookies → reddit.com
#    复制 token_v2 和 reddit_session 的值
# 2. 创建 .dev.vars（已 gitignore）
cat > .dev.vars << 'EOF'
REDDIT_COOKIE=token_v2=xxx; reddit_session=yyy
EOF

# 3. 启动 Worker（自动读取 .dev.vars）
npx wrangler dev --port 8787
```

**方式 2：终端环境变量**

```bash
HTTPS_PROXY=http://127.0.0.1:8888 \
  npx wrangler dev --port 8787 --var REDDIT_COOKIE:"token_v2=xxx; reddit_session=yyy"
```

**方式 3：前端对话框**

启动后打开浏览器 → `Ctrl+Shift+C` → 粘贴 cookie → Save。见下方 [Reddit Cookie 对话框](#3-cookie-配置方式)。

### 预览构建产物

```bash
pnpm build:app   # 构建
pnpm dev:preview # 启动预览服务器（http://localhost:4173）
```

### 代码检查

```bash
pnpm validate    # svelte-check TypeScript 类型检查
```

---

## 部署到 GitHub Pages

项目通过 `deploy.sh` 脚本实现一键部署，原理是将 `dist/` 目录作为独立 Git 仓库强制推送到 `pages` 分支。

```bash
pnpm deploy
```

脚本执行的步骤：
1. 删除旧的 `dist/` 目录
2. 执行 `pnpm build:app`（routify 生成路由 + vite 构建）
3. 复制 `index.html` → `404.html`（SPA 路由 fallback）
4. 创建 `.nojekyll`（禁用 GitHub Jekyll 处理）
5. 在 `dist/` 内初始化 git，强制推送到 `pages` 分支

GitHub Pages 需配置为使用 `pages` 分支的根目录。

---

## 原生移动端构建

```bash
# Android
pnpm build:android   # 构建 Web + 同步 Capacitor + 打开 Android Studio

# iOS
pnpm build:ios       # 构建 Web + 同步 Capacitor + 打开 Xcode
```

---

## 注意事项

### 1. Reddit API 认证与代理

Reddit 已于 2025 年起封闭公开 JSON API（`.json` 端点），未认证请求返回 403。项目通过 **Cloudflare Worker** 实现统一代理，支持两种认证模式：

| 模式 | 适用场景 | 配置方式 |
|------|---------|---------|
| **Cookie（Worker 环境变量）** | 公网部署 / 个人使用 | 将 cookie 部署到 Worker 环境变量，所有用户共享 |
| **Cookie（前端对话框）** | 本地开发 / 多用户自行填写 | 浏览器登录 Reddit → `Ctrl+Shift+C` 填写 |
| **OAuth** | 公网部署 / 多用户 | 注册 Reddit App → 部署 Client ID/Secret 到 Worker |

**Worker 认证逻辑**（自动回退）：

```
请求进入 Worker
  ├─ 携带 X-Reddit-Cookie 头？
  │     → Cookie 模式（用户前端自行填写）
  ├─ 携带 env.REDDIT_COOKIE 环境变量？
  │     → Cookie 模式（服务端统一代理，所有用户共享）
  └─ 都没有 → 尝试 OAuth token
        ├─ REDDIT_CLIENT_ID 有效？ → OAuth 模式（生产环境）
        └─ 无 → 401 "No auth configured"
```

### 2. Cloudflare Worker 部署

```bash
# 1. 登录 Cloudflare
npx wrangler login

# 2. 部署 Worker
npx wrangler deploy
# → 输出 URL 如：https://reddit-matrix-api.YOUR_ACCOUNT.workers.dev
```

部署后，前端通过 `.env.production` 中的 `VITE_API_URL` 指向该地址。

### 3. Cookie 配置方式

#### 方式 A：Worker 环境变量（推荐 — 所有用户共享）

将 cookie 部署到 Worker 环境变量后，所有访问者无需任何操作就能正常使用。适合个人或小范围使用。

```bash
# 1. 从浏览器获取 cookie
#    F12 → Application → Cookies → reddit.com
#    复制所有 Name=Value 键值对，用 ; 连接
#    仅需 token_v2 和 reddit_session 两个关键字段
#    示例格式：token_v2=xxx; reddit_session=yyy

# 2. 部署到 Worker
npx wrangler secret put REDDIT_COOKIE
# 粘贴上面复制的 cookie 内容

# 3. 更新 Worker
npx wrangler deploy
```

**Cookie 过期更新：**

Reddit session cookie 有效期约 2-4 周。过期后 API 请求会返回 403，Worker 日志中出现 `Reddit 403 — cookie may have expired`。

更新步骤：
```bash
# 1. 浏览器重新登录 Reddit，获取新的 cookie（同上步骤 1）
# 2. 删除旧的 secret
npx wrangler secret delete REDDIT_COOKIE

# 3. 写入新的
npx wrangler secret put REDDIT_COOKIE
# 粘贴新 cookie

# 4. 重新部署
npx wrangler deploy
```

#### 方式 B：前端对话框（按用户独立填写）

每个用户自行填写自己的 Reddit cookie，互不影响。适合多用户场景。

**触发方式：**

| 平台 | 操作 |
|------|------|
| 桌面 | `Ctrl + Shift + C` |
| 手机 | 连续 7 次快速点击屏幕**左下角** |

Cookie 存储在浏览器 `localStorage` 中，随每次请求通过 `X-Reddit-Cookie` 头发送至 Worker。**cookie 仅存本地，不上传任何服务器。**

> **优先级说明：** `X-Reddit-Cookie` 请求头优先级高于 Worker 环境变量。即使用户自己填了 cookie，Worker 会优先使用用户的 cookie。

### 4. OAuth 审批通过后切换步骤

```bash
# 1. 部署 Reddit App 凭证到 Worker
npx wrangler secret put REDDIT_CLIENT_ID    # 输入 client_id
npx wrangler secret put REDDIT_CLIENT_SECRET  # 输入 secret

# 2. 如果之前用 cookie 模式，删除临时 cookie
npx wrangler secret delete REDDIT_COOKIE   # 若有的话

# 3. 重新部署 Worker
npx wrangler deploy

# 4. 用户端：清除 localStorage 中的 cookie
#    打开 app → Ctrl+Shift+C → 点 Clear
```

切换后无需修改任何前端代码，Worker 自动回退到 OAuth。

> **注意：** 删除 `REDDIT_COOKIE` 后，之前通过前端对话框填写 cookie 的用户不受影响（他们的 cookie 在浏览器端 `localStorage`，随请求头每次传入）。如需同时清除所有用户的 cookie 访问，还需通知用户清除浏览器缓存。

### 5. Service Worker 说明

项目**不使用** Service Worker。iOS Safari 存在一个已知 bug：当 origin 下有任何 SW 注册时，跨域 iframe 内的 302 重定向会导致父页面整体重载。由于 App 核心功能（Reddit API、redgifs 视频）均需在线，SW 的离线缓存价值有限。PWA 安装能力通过静态 Web App Manifest 保留。

### 6. WASM 模块必须预编译

项目包含一个 Rust 编写的模糊搜索模块 (`fuzzy_complete`)，首次克隆后**必须手动编译**，否则 Vite 启动会报错：

```bash
wasm-pack build ./fuzzy_complete --target web
```

编译产物位于 `fuzzy_complete/pkg/`，已添加到 `.gitignore`，不随源码提交。

### 7. 图片 URL 的两层结构

`Post` 类型包含两个 URL 字段：

- `url`：CDN 压缩后的预览图（用于瀑布流网格快速加载）
- `fullUrl?`：`i.redd.it` 直链原图（用于 Lightbox 全屏显示）

对于非 Gallery 的单图帖，`fullUrl` 不存在，Lightbox 会 fallback 到 `url`。对于 Gallery 帖，两者均会填充。

### 8. ESM 模块类型

`package.json` 中设置了 `"type": "module"`，整个项目以 ESM 运行。Vite 5 及其插件都是 ESM-only，**不可删除**此字段。

### 9. Capacitor 版本锁定

Capacitor 依赖锁定在 v3（`^3.2.5`）。升级至 v4/v5 需要同步修改 `capacitor.config.json`、原生平台配置，以及可能的插件 API 变更，需谨慎操作。

### 10. Sass 现代编译器 API

`vite.config.ts` 中配置了 `css.preprocessorOptions.scss.api: 'modern-compiler'`，以消除 Sass 的 Legacy API 弃用警告。若降级 Sass 版本（< 1.45），需移除此配置。

### 11. 过滤的内容类型

`api.ts` 中自动过滤以下非图片内容：

- 纯文字帖子（`is_self`）
- 指向自身版块评论页的链接
- 视频链接（`v.redd.it`、`youtu.be`、`.gifv`）
- 特定图床（`gfycat.com`、`macdesktops.com`）
- Gallery 索引页（`reddit.com/gallery/...` 未展开的链接）

### 12. 排序持久化机制

每个 subreddit 的排序偏好独立存储在 `localStorage`，key 格式为 `redditMatrix:sort:<subreddit>`。切换版块时自动恢复上次使用的排序方式。

点击**已选中的排序 Tab** 会递增 `refreshSignal` store，触发 `[subreddit].svelte` 中的 `identifier` 变化，从而使 `svelte-infinite-loading` 重置并从第一页重新加载内容。

### 13. Lightbox 预加载与无限浏览

Lightbox 内浏览时，`Grid.svelte` 通过响应式语句监测 `lightboxIndex` 与 `posts.length` 的距离：

- 当 `lightboxIndex >= posts.length - 3` 时，向父组件 dispatch `needMore` 事件
- `[subreddit].svelte` 收到事件后调用 `fetchNextPage()` 静默后台加载
- `fetchNextPage()` 内置 `_fetchInFlight` 并发锁，防止滚动触发与 Lightbox 触发同时发起重复请求
- 新 posts 追加到 store 后，Lightbox 的"下一张"按钮自动恢复可用

### 14. 关闭 Lightbox 后的定位逻辑

关闭时执行以下步骤（`Grid.closeLightbox`）：

1. `await tick()` — 等待 Svelte 将新加载的卡片写入 DOM
2. `await setTimeout(80ms)` — 等待 Lightbox 完成卸载动画
3. 最多重试 10 个动画帧，确认目标卡片 `getBoundingClientRect().height > 0`（masonry 已完成定位）
4. 距离 < 2 倍视口高度 → `smoothScrollTo()`（ease-in-out-cubic，450ms）完成后触发轮廓闪烁
5. 距离 ≥ 2 倍视口高度 → `scrollIntoView({ behavior: 'instant' })` 瞬间跳转后触发轮廓闪烁

轮廓闪烁通过在 `document.body` 上创建 `position: fixed` 的覆盖层（`box-shadow` 动画）实现，不受任何祖先 `overflow: hidden` 裁剪影响。
