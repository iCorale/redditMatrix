# Reddit Matrix

瀑布流图片版块浏览器。页面在 `src/pages/r/[subreddit].svelte`。列表请求由浏览器扩展或 Surge 脚本换成 Reddit 的 partial，页面自己不解析 HTML。

## 图片

网格使用原图：`url={post.fullUrl ?? post.url}`。不要改成预览图。

## 翻页

一次只拉一页。`getPosts` 返回 `false`（HTTP 非 200，或扩展回 502）是失败：不要把信息流标成结束。用户再用滚轮或触摸滑一次才重试。布局产生的滚动不要立刻再请求。

返回空数组才是列表结束，这时才停止。扩展侧：成功（含空 `children`）回 200；读失败回 502。不要把空列表回成 502。

灯箱右侧转圈只在正在请求、信息流未结束、且停在最后一张时出现。请求结束而没有新图，转圈要停。失败时不要清掉「已经请求过」，否则会马上再请求。

跳跃按钮不向 Reddit 要数据。本地缓冲不够就停住等；数据到了也不要自动跳。

## 扩展

`extension/page.js` 拦截 `/r/...json`。`background.js` 拉 partial。权限只有 `www.reddit.com`，不要改去 `old.reddit.com`。

普通版块是 `<shreddit-post>`，翻页用帖子 id。版块搜索是另一套页面：`/svc/shreddit/r/{版块}/search/?q=&type=posts&sort=`。用 `data-thingid` 取帖，图片从 `preview.redd.it` 还原成 `i.redd.it`。下一页是 HTML 里的 `cursor`，不是帖子 id。应用的 `best` 对应搜索的 `relevance`，`rising` 对应 `hot`。

改了 `extension/` 之后，要在 `chrome://extensions` 重新加载扩展。Vite 热更新不会更新扩展。

本机终端直接请求 Reddit 经常是 403。核对列表用已登录浏览器，或走本机 Surge 代理。

Svelte 的 `<script context="module">` 和实例脚本共用 import。同一名字不要在两边各 import 一次。

## Surge

Surge 仓库只放要推送的模块和脚本，不要在那里加说明文件。

模块从 `https://raw.githubusercontent.com/iCorale/surge/main/Script/RedditMatrix.js` 拉取。不要改回 jsDelivr。`Script/RedditMatrix.js` 与扩展的列表行为保持一致：搜索 partial、游标翻页、取完回 200 空列表、失败回 502。

本机 Surge 用的是配置目录里的另一份：模块 `script-path=RedditMatrix.js`，脚本放在同一目录。不要把这份本地模块指回仓库工作区。推送之前也不要改成 GitHub 地址，否则会拉到旧脚本。

改列表行为时，三处一起改：扩展、Surge 仓库里的 `Script/RedditMatrix.js`、本机配置目录里的那份副本。

Surge 脚本没有 `URL` 和 `btoa`。持久存储是 `$persistentStore.write(值, 键)`。键只能是字母、数字、`.`、`_`、`-`，最长 128。搜索游标写在这里，不能只放内存。

只替换来自 `icorale.github.io`、`localhost`、`127.0.0.1` 的列表请求。本地验证时，请求要带这些来源之一的 `Origin`。改完本机模块后重新加载 Surge，必要时关掉再打开该模块。
