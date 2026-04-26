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
| **PWA 支持** | 可安装到桌面/手机主屏幕，离线访问静态资源 |
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
│   │   ├── _layout.svelte       # 全局布局
│   │   ├── _fallback.svelte     # 404 页面
│   │   └── r/
│   │       └── [subreddit].svelte  # 子版块图片墙页面（核心页面）
│   │
│   ├── components/
│   │   ├── Card.svelte          # 单张图片卡片（含长按选择、播放角标）
│   │   ├── Grid.svelte          # 瀑布流网格，集成 Lightbox 与预加载逻辑
│   │   ├── Lightbox.svelte      # 全屏大图预览（缩放/平移/Redgifs iframe）
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
│   │   ├── api.ts               # Reddit API 数据获取与转换（核心）
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
├── assets/                      # 静态资源（图标、PWA 图片等）
├── vite.config.ts               # Vite 构建配置
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
    ├── isNativePlatform?  → @capacitor-community/http（绕过系统级 CORS）
    ├── isLocal?           → Vite proxy /reddit-api → reddit.com
    └── 其他（GitHub Pages 等）→ 直接 fetch Reddit API
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
| PWA | vite-plugin-pwa + Workbox | ^0.21 / ^7.4 |
| 原生移动端 | Capacitor | ^3.2 |

---

## 本地开发

### 环境准备

- Node.js ≥ 18
- pnpm ≥ 9
- Rust + wasm-pack（模糊搜索 WASM 模块需要）

```bash
# 安装 wasm-pack（如未安装）
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

### 步骤

```bash
# 1. 安装依赖
pnpm install

# 2. 编译 Rust WASM 模块（仅首次或修改 fuzzy_complete 后需要）
wasm-pack build ./fuzzy_complete --target web

# 3. 启动开发服务器
pnpm dev:start
```

开发服务器运行于 `http://localhost:5173`。

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

### 1. CORS 策略（重要）

Reddit 公开 JSON API 不对 `localhost` 放行 CORS，但对正式域名（如 GitHub Pages）是允许的。项目已按以下策略处理：

| 运行环境 | CORS 处理方式 |
|----------|--------------|
| `localhost` / `127.0.0.1` | 通过 Vite dev/preview proxy 转发（`/reddit-api` → `reddit.com`） |
| GitHub Pages 等正式部署 | 直接请求 Reddit API（Reddit 对真实域名放行） |
| iOS / Android 原生 | `@capacitor-community/http` 插件（系统级请求，无 CORS 限制） |

> **不要**为生产环境引入第三方 CORS 代理（如 `corsproxy.io`、`allorigins.win`）——这些服务不稳定，且可能屏蔽 NSFW 内容。

### 2. WASM 模块必须预编译

项目包含一个 Rust 编写的模糊搜索模块 (`fuzzy_complete`)，首次克隆后**必须手动编译**，否则 Vite 启动会报错：

```bash
wasm-pack build ./fuzzy_complete --target web
```

编译产物位于 `fuzzy_complete/pkg/`，已添加到 `.gitignore`，不随源码提交。

### 3. 图片 URL 的两层结构

`Post` 类型包含两个 URL 字段：

- `url`：CDN 压缩后的预览图（用于瀑布流网格快速加载）
- `fullUrl?`：`i.redd.it` 直链原图（用于 Lightbox 全屏显示）

对于非 Gallery 的单图帖，`fullUrl` 不存在，Lightbox 会 fallback 到 `url`。对于 Gallery 帖，两者均会填充。

### 4. ESM 模块类型

`package.json` 中设置了 `"type": "module"`，整个项目以 ESM 运行。Vite 5 及其插件都是 ESM-only，**不可删除**此字段。

### 5. Capacitor 版本锁定

Capacitor 依赖锁定在 v3（`^3.2.5`）。升级至 v4/v5 需要同步修改 `capacitor.config.json`、原生平台配置，以及可能的插件 API 变更，需谨慎操作。

### 6. Sass 现代编译器 API

`vite.config.ts` 中配置了 `css.preprocessorOptions.scss.api: 'modern-compiler'`，以消除 Sass 的 Legacy API 弃用警告。若降级 Sass 版本（< 1.45），需移除此配置。

### 7. 过滤的内容类型

`api.ts` 中自动过滤以下非图片内容：

- 纯文字帖子（`is_self`）
- 指向自身版块评论页的链接
- 视频链接（`v.redd.it`、`youtu.be`、`.gifv`）
- 特定图床（`gfycat.com`、`macdesktops.com`）
- Gallery 索引页（`reddit.com/gallery/...` 未展开的链接）

### 8. 排序持久化机制

每个 subreddit 的排序偏好独立存储在 `localStorage`，key 格式为 `redditMatrix:sort:<subreddit>`。切换版块时自动恢复上次使用的排序方式。

点击**已选中的排序 Tab** 会递增 `refreshSignal` store，触发 `[subreddit].svelte` 中的 `identifier` 变化，从而使 `svelte-infinite-loading` 重置并从第一页重新加载内容。

### 9. Lightbox 预加载与无限浏览

Lightbox 内浏览时，`Grid.svelte` 通过响应式语句监测 `lightboxIndex` 与 `posts.length` 的距离：

- 当 `lightboxIndex >= posts.length - 3` 时，向父组件 dispatch `needMore` 事件
- `[subreddit].svelte` 收到事件后调用 `fetchNextPage()` 静默后台加载
- `fetchNextPage()` 内置 `_fetchInFlight` 并发锁，防止滚动触发与 Lightbox 触发同时发起重复请求
- 新 posts 追加到 store 后，Lightbox 的"下一张"按钮自动恢复可用

### 10. 关闭 Lightbox 后的定位逻辑

关闭时执行以下步骤（`Grid.closeLightbox`）：

1. `await tick()` — 等待 Svelte 将新加载的卡片写入 DOM
2. `await setTimeout(80ms)` — 等待 Lightbox 完成卸载动画
3. 最多重试 10 个动画帧，确认目标卡片 `getBoundingClientRect().height > 0`（masonry 已完成定位）
4. 距离 < 2 倍视口高度 → `smoothScrollTo()`（ease-in-out-cubic，450ms）完成后触发轮廓闪烁
5. 距离 ≥ 2 倍视口高度 → `scrollIntoView({ behavior: 'instant' })` 瞬间跳转后触发轮廓闪烁

轮廓闪烁通过在 `document.body` 上创建 `position: fixed` 的覆盖层（`box-shadow` 动画）实现，不受任何祖先 `overflow: hidden` 裁剪影响。
