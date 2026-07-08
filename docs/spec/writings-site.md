# 站点说明

本文档记录当前仓库的工作方式和实现约定，不再作为设计讨论稿维护。代码是事实来源；修改代码后如果本文件与实际实现不一致，必须同步更新本文件。

## 仓库分工

- 内容仓库：`belleangelina/writings`
  - 存放文章 Markdown、封面、插图和相关资源。
  - 作为站点内容源。
  - 默认分支为 `main`。
- 站点仓库：`belleangelina/belleangelina.github.io`
  - 存放 Astro 站点代码、构建脚本、部署 workflow 和说明文档。
  - 发布到 GitHub Pages：`https://belleangelina.github.io/`。
  - 默认分支为 `main`。

本仓库只负责展示、构建和发布；文章内容在 `writings` 仓库维护。

## 当前实现

- 技术栈：Astro 静态站点。
- 站点名称：`天然未来派的摸鱼小屋`。
- 顶部导航：左侧菱形标识和站名，右侧 `首页 / 文章 / 关于 / 主题切换`。
- 窄屏处理：视口宽度不超过 `768px` 时隐藏顶部栏站名文字，只保留菱形标识。
- 主题模式：默认浅色；用户选择保存在 `localStorage` 的 `belle-theme-v2`，取值为 `light` 或 `dark`。
- 构建产物：静态 HTML/CSS/JS，同时生成 `rss.xml` 和 `sitemap.xml`。

首页当前包含：

- 站名 Hero。
- 打字机短文案。
- `进入目录` 和 `随便看看` 两个按钮。
- 长篇、短篇、记录三个分类分段。
- 每个分类分段展示对应分类的最新内容；长篇优先取最新章节，没有章节时回退到长篇作品。

首页打字机文案当前临时与 `web/` 示例一致：

```text
一个写代码的人,顺便记点东西。
关于工程、设计、和一些具体的判断。
不追求漂亮,追求清楚。
```

## 路由

当前路由结构：

```text
/
/articles/
/articles/novels/
/articles/novels/<novel-slug>/
/articles/novels/<novel-slug>/<volume-slug>/
/articles/novels/<novel-slug>/<volume-slug>/<chapter-slug>/
/articles/shorts/
/articles/shorts/<short-slug>/
/articles/notes/
/articles/notes/<note-slug>/
/about/
/rss.xml
/sitemap.xml
```

`/articles/` 只展示长篇、短篇、记录三个分类入口。长篇、短篇、记录列表页使用 `ArticleCard` 展示分类、标题、日期 / 分类 meta 和阅读入口。

## 内容规则

内容读取逻辑位于 `src/lib/content.ts`。

- 本地默认内容目录：`writings-content`。
- 可通过环境变量 `WRITINGS_CONTENT_DIR` 指定内容目录。
- 只读取 Markdown `.md`。
- 只有 `status: published` 的内容会上站。
- slug 来自目录名或文件名，不需要额外 frontmatter 字段。
- 短篇和记录按 `date` 倒序。
- 长篇作品按 `date` 倒序。
- 长篇内部卷按 `volume` 升序，章节按 `chapter` 升序。
- frontmatter 的 `cover` 和正文图片路径会重写到 `/content/...`。

内容仓库目录约定：

```text
writings/
├─ novels/
│  └─ <novel-slug>/
│     ├─ index.md
│     ├─ cover.jpg
│     └─ <volume-slug>/
│        ├─ index.md
│        └─ <chapter-slug>.md
├─ shorts/
│  ├─ <short-slug>.md
│  └─ <short-slug>/
│     ├─ cover.jpg
│     └─ images/
└─ notes/
   ├─ <note-slug>.md
   └─ <note-slug>/
      └─ images/
```

常用 frontmatter：

```yaml
title: 标题
status: published
summary: 简介，可选
date: 2026-07-04
cover: ./relative/path/to/cover.jpg
```

长篇卷需要 `volume` 字段，章节需要 `chapter` 字段：

```yaml
title: 第一章 夜航
status: published
chapter: 1
date: 2026-07-04
summary: 第一章简介。
```

## 构建和发布

常用命令：

```bash
npm run dev
npm run build
npm run preview
```

构建前会执行 `scripts/copy-content-assets.mjs`，把内容仓库资源复制到站点可访问路径。若本地没有 `writings-content`，脚本会跳过复制。

发布流程：

```text
push 文章到 writings/main
        ↓
writings GitHub Actions 触发
        ↓
向 belleangelina.github.io 发送 repository_dispatch
        ↓
belleangelina.github.io GitHub Actions 拉取 writings 内容
        ↓
构建 Astro 静态站点
        ↓
部署到 GitHub Pages
```

站点仓库保留 `workflow_dispatch` 手动触发入口，用于自动触发失败、调试部署或临时重建站点。跨仓库触发使用内容仓库 secret `SITE_REPO_DISPATCH_TOKEN`。

## 文档同步规则

修改代码后如果 README 或本文件与当前实现不符，必须同步更新文档。

常见需要同步文档的改动：

- 站点名称、导航、首页结构或主题行为变化。
- 路由结构变化。
- 内容目录、frontmatter、排序或资源路径规则变化。
- 构建、部署或内容同步流程变化。
