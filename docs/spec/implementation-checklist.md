# 当前工作状态

本文件只记录当前仓库继续工作所必需的信息。历史设计讨论和已失效规格不再保留，具体实现以代码为准。

## 项目概况

- 站点仓库：`belleangelina/belleangelina.github.io`
- 技术栈：Astro 静态站点
- 发布目标：GitHub Pages，`https://belleangelina.github.io/`
- 内容源：`belleangelina/writings`
- 本地默认内容目录：`writings-content`
- 当前站名：`天然未来派的摸鱼小屋`

## 当前实现

- 顶部导航：左侧菱形标识 + 站名，右侧 `首页 / 文章 / 关于 / 主题切换`。
- 窄屏处理：视口宽度不超过 `768px` 时隐藏顶部栏站名文字，只保留菱形标识。
- 首页：站名 Hero、打字机文案、`进入目录` 和 `随便看看` 按钮、长篇 / 短篇 / 记录三个分类分段。
- 首页打字机文案当前临时与 `web/` 示例一致。
- 文章总览页 `/articles/` 只展示分类入口。
- 长篇、短篇、记录列表页使用 `ArticleCard`。
- 阅读页保留独立路由；长篇章节页保留上一章 / 返回目录 / 下一章导航。
- 主题切换使用 `localStorage` 的 `belle-theme-v2`，默认浅色。
- 构建生成 `rss.xml` 和 `sitemap.xml`。

## 内容规则

- 只读取 Markdown `.md`。
- 只有 `status: published` 的内容会上站。
- 短篇和记录按 `date` 倒序。
- 长篇作品按 `date` 倒序。
- 长篇内部卷按 `volume` 升序，章节按 `chapter` 升序。
- 内容资源路径会重写到 `/content/...`。

## 常用命令

```bash
npm run dev
npm run build
npm run preview
```

## 最近验证

2026-07-08 本地执行 `npm run build` 通过。

本地提示 `writings-content` 不存在，因此内容资源复制跳过；这是当前本地环境状态，不是构建错误。
