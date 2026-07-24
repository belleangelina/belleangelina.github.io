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
- 主题模式：默认浅色；用户选择保存在 `localStorage` 的 `belle-theme-v2`，取值为 `light` 或 `dark`。手动切换时，背景、卡片、导航、正文文字和主题图标统一使用 `--theme-duration` 与 `--theme-ease`，两个方向的过渡参数一致。
- 本地阅读记录：正文页把最后阅读的正文、滚动位置和保存时间保存在 `localStorage` 的 `belle-last-reading-v1`，只在同一浏览器内有效。
- 长篇详情：所有卷位于同一个折叠目录中，不在目录内重复显示卷摘要；章节在桌面端按三列排列，移动端按单列排列。默认展开第一卷，有本书阅读记录时展开记录所在卷，并将入口改为继续阅读。各卷可独立平滑展开；无论展开或收起，卷标题及其上方内容保持不动，仅卷正文和后续内容随高度变化。
- 页面发现：每个 HTML 页面输出 canonical、Open Graph 和 Twitter 元数据；站点同时提供 `robots.txt`、`sitemap.xml`、`rss.xml` 和 SVG favicon。
- 可访问性：主导航使用 `aria-current` 标识当前页面，键盘焦点统一可见，并支持 `prefers-reduced-motion`。
- 构建产物：静态 HTML/CSS/JS，同时生成 `rss.xml` 和 `sitemap.xml`。

首页当前包含：

- 首页第一屏主标题显示站名。
- 打字机短文案。
- `进入目录` 按钮，以及一个阅读按钮：没有本地阅读记录时显示 `随便看看`，随机进入一篇短篇、笔记或长篇首章；有本地阅读记录时显示 `继续阅读`，进入上次正文并恢复滚动位置。
- 长篇、短篇、笔记三个分类分段。
- 每个分类分段展示对应分类的最新内容，卡片顶部标签分别为 `NOVELS`、`SHORTS` 和 `NOTES`；移动端保留分区标题与目录按钮在左、内容卡片在右的双栏关系。卡片标题固定为单行：未溢出的标题只渲染一份且不滚动；溢出的标题在开头停顿一次，再通过仅用于动画的副本，以 64px 间距单向衔接下一轮。循环距离按标题副本的实际布局位置计算，避免间距调整后在循环边界跳变。长篇卡片显示作品名，链接、日期和章序取最新章节，没有章节时回退到长篇作品；短篇和笔记卡片只在元信息中显示日期。

首页打字机文案：

```text
一个写代码的人，顺便记点东西。
写代码，也写小说，偶尔记点别的。
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

`/articles/` 只展示长篇、短篇、笔记三个分类入口。长篇、短篇、笔记列表页使用 `ArticleCard` 展示英文顶部标签、标题、日期 / 中文分类 meta 和阅读入口；卷章节列表同样使用英文顶部标签。

`/about/` 只展示站点说明，不放分类或 RSS 跳转按钮。分类入口由顶部导航、首页和文章目录承担。

`/rss.xml` 是给 RSS 阅读器使用的订阅源，不作为普通内容页面展示；浏览器直接打开时可能显示 XML。

## 内容规则

内容读取逻辑位于 `src/lib/content.ts`。

- 本地默认内容目录：`writings-content`。
- 可通过环境变量 `WRITINGS_CONTENT_DIR` 指定内容目录。
- 只读取 Markdown `.md`。
- 只有 `status: published` 的内容会上站。
- slug 来自目录名或文件名，不需要额外 frontmatter 字段。
- 短篇和笔记按 `date` 倒序。
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
npm run check
npm run build
npm run preview
npm run verify
```

`npm run verify` 依次执行 Astro 类型检查、静态构建和 `scripts/verify-build.mjs`。产物审计会检查页面 canonical、描述、单一 `h1`、重复 `id`、内部链接、图片 `alt`、sitemap、RSS self link、robots 和 favicon。

构建前会执行 `scripts/copy-content-assets.mjs`，把内容仓库资源复制到站点可访问路径。若本地没有 `writings-content`，脚本会跳过复制。

依赖使用精确版本并提交 `package-lock.json`。本地和 GitHub Actions 均使用 Node.js 22 或更高版本；GitHub Actions 使用 `npm ci` 按锁文件安装。

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

除部署 workflow 外，`.github/workflows/ci.yml` 会在 `agent/**` 分支 push、Pull Request 和手动触发时运行完整 `npm run verify`，但不会部署页面。

## GitHub 配置

站点仓库 `belleangelina/belleangelina.github.io`：

1. 在 `Settings -> Pages -> Build and deployment -> Source` 中选择 `GitHub Actions`。
2. 保留 `.github/workflows/deploy.yml`。当前 workflow 已支持：
   - `push` 到站点仓库 `main` 时构建部署。
   - 收到 `repository_dispatch` 且 `event_type` 为 `content-updated` 时构建部署。
   - 手动 `workflow_dispatch` 触发。
   - 构建时 checkout `belleangelina/writings` 到 `writings-content`。

内容仓库 `belleangelina/writings`：

1. 创建一个 fine-grained personal access token。
2. `Repository access` 只选择 `belleangelina.github.io`。
3. `Repository permissions` 至少给目标站点仓库 `Contents: Read and write`。`repository_dispatch` 是发给站点仓库的 API 请求，所以 token 权限作用在 `belleangelina.github.io`，不是 `writings`。
4. 在 `belleangelina/writings -> Settings -> Secrets and variables -> Actions -> Secrets` 新增仓库 secret：

```text
SITE_REPO_DISPATCH_TOKEN=<上一步创建的 token>
```

5. 在 `belleangelina/writings` 增加 workflow，例如 `.github/workflows/notify-site.yml`：

```yaml
name: Notify site

on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger site rebuild
        env:
          SITE_REPO_DISPATCH_TOKEN: ${{ secrets.SITE_REPO_DISPATCH_TOKEN }}
        run: |
          curl --fail-with-body -L \
            -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer ${SITE_REPO_DISPATCH_TOKEN}" \
            -H "X-GitHub-Api-Version: 2026-03-10" \
            https://api.github.com/repos/belleangelina/belleangelina.github.io/dispatches \
            -d '{"event_type":"content-updated"}'
```

验证方式：

1. 向 `belleangelina/writings/main` push 一次文章改动。
2. 打开 `belleangelina/writings -> Actions`，确认 `Notify site` 成功。
3. 打开 `belleangelina.github.io -> Actions`，确认 `Deploy site` 被 `repository_dispatch` 触发。
4. 部署完成后打开 `https://belleangelina.github.io/` 验证页面内容。

排查顺序：

1. 如果 `writings -> Actions` 没有 `Notify site` 运行记录，说明内容仓库 workflow 没有被触发。检查 `.github/workflows/notify-site.yml` 是否已经在 `writings/main`，以及 push 是否真的推到了 `main`。
2. 如果 `Notify site` 失败，先看 `Trigger site rebuild` 日志里的 HTTP 状态。常见原因是 `SITE_REPO_DISPATCH_TOKEN` secret 名称不一致、token 过期、token 没有选择 `belleangelina.github.io`，或 `Contents` 权限不是 `Read and write`。
3. 如果 `Notify site` 成功但 `belleangelina.github.io -> Actions` 没有新运行，检查发送的 `event_type` 是否正好是 `content-updated`，因为站点仓库 workflow 只监听这个类型。
4. 可以在 `writings -> Actions -> Notify site -> Run workflow` 手动触发一次，单独验证 dispatch 配置。

## 文档同步规则

修改代码后如果 README 或本文件与当前实现不符，必须同步更新文档。

常见需要同步文档的改动：

- 站点名称、导航、首页结构或主题行为变化。
- 路由结构变化。
- 内容目录、frontmatter、排序或资源路径规则变化。
- 构建、部署或内容同步流程变化。
