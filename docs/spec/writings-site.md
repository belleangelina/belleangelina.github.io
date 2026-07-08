# 站点当前说明

本文档记录当前代码已经实现的站点结构和约定。历史设计讨论不在这里保留；如果本文档和代码冲突，以代码为准，并同步修正文档。

## 基本信息

- 站点名称：`天然未来派的摸鱼小屋`
- 技术栈：Astro 静态站点
- 发布目标：GitHub Pages，`https://belleangelina.github.io/`
- 内容源仓库：`belleangelina/writings`
- 本地默认内容目录：`writings-content`

## 页面结构

当前路由：

```text
/
/articles/
/articles/novels/
/articles/novels/<novel>/
/articles/novels/<novel>/<volume>/
/articles/novels/<novel>/<volume>/<chapter>/
/articles/shorts/
/articles/shorts/<slug>/
/articles/notes/
/articles/notes/<slug>/
/about/
/rss.xml
/sitemap.xml
```

顶部导航：

```text
◆ 天然未来派的摸鱼小屋    首页 / 文章 / 关于 / 主题切换
```

视口宽度不超过 `768px` 时隐藏顶部栏站名文字，只保留菱形标识，避免长中文站名挤压导航。

## 首页

首页当前由以下部分组成：

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

## 内容读取规则

内容读取逻辑位于 `src/lib/content.ts`。

- 只读取 Markdown `.md`。
- 只有 `status: published` 的内容会上站。
- 短篇和记录按 `date` 倒序。
- 长篇作品按 `date` 倒序。
- 长篇内部卷按 `volume` 升序。
- 卷内章节按 `chapter` 升序。
- frontmatter 的 `cover` 和正文图片路径会重写到 `/content/...`。

## 页面展示规则

- `/articles/` 只展示长篇、短篇、记录三个分类入口。
- 长篇、短篇、记录列表页使用 `ArticleCard`。
- 卡片展示分类、标题、日期 / 分类 meta 和阅读入口。
- 阅读页保留独立路由。
- 长篇章节页保留上一章 / 返回目录 / 下一章导航，并支持跨卷衔接。

## 主题与构建

- 默认主题为浅色。
- 用户主题选择存入 `localStorage` 的 `belle-theme-v2`。
- 构建生成 `rss.xml` 和 `sitemap.xml`。

常用命令：

```bash
npm run dev
npm run build
npm run preview
```
