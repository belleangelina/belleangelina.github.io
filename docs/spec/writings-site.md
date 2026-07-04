# 文章展示网站设计文档

## 1. 背景

本项目用于构建一个发布到 GitHub Pages 的个人文章展示网站，用来展示 `belleangelina/writings-public` 仓库中的公开文章。

当前内容以小说为主，包括长篇和短篇；同时也会包含开发调试经验、记录。后续可能扩展更多文章类型。

## 2. 仓库分工

采用双仓库方案。

- 内容仓库：`belleangelina/writings-public`
  - 存放文章 Markdown、封面、插图和相关资源。
  - 作为网站内容源。
  - 已确认是 public 仓库，默认分支为 `main`。

- 站点仓库：`belleangelina/belleangelina.github.io`
  - 存放 Astro 网站代码、构建脚本、部署 workflow 和设计文档。
  - 发布到 GitHub Pages。
  - 对应站点地址：`https://belleangelina.github.io/`
  - 已确认是 public 仓库，默认分支为 `main`。

选择该方案的原因：内容和网站实现解耦；`writings-public` 只负责写作内容，`belleangelina.github.io` 只负责展示、构建和发布。

## 3. 技术栈

站点使用 Astro。

理由：

- 更适合文章、小说、记录类静态内容站。
- 支持 Markdown / MDX。
- 适合用 Content Collections 或自定义内容加载逻辑管理 frontmatter。
- 可以静态构建并部署到 GitHub Pages。

### 3.1 GitHub Pages 静态约束

GitHub Pages 只托管静态网站。站点应在 GitHub Actions 构建阶段把 Markdown / MDX 内容转换为静态 HTML、CSS 和 JavaScript，然后由 GitHub Pages 发布。

因此 V1 不应依赖服务端能力，例如：

- 后端 API 服务
- 数据库读写
- 用户登录 / 会话
- 服务端渲染 SSR
- 服务端搜索
- 评论系统后端
- 表单提交处理
- 动态生成私有用户内容

可以使用的能力：

- 静态预生成页面
- 浏览器端 JavaScript
- 标签筛选
- 本地搜索索引，如果后续需要
- 暗色模式
- 阅读进度等本地状态
- 从公开 API 拉取公开数据，如果后续需要

设计结论：V1 应按纯静态站点设计。评论、登录、服务端搜索、在线编辑、订阅邮件等需要服务端或外部服务的能力，不进入核心范围。

## 4. 发布流程

采用自动发布。

目标流程：

```text
push 文章到 writings-public/main
        ↓
writings-public GitHub Actions 触发
        ↓
向 belleangelina.github.io 发送 repository_dispatch
        ↓
belleangelina.github.io GitHub Actions 拉取 writings-public 内容
        ↓
构建 Astro 静态站点
        ↓
部署到 GitHub Pages
```

约束和注意事项：

- 两个仓库都使用 public 仓库，适配 GitHub 免费账户。
- 跨仓库触发需要配置 token 或其他可触发 `repository_dispatch` 的权限机制。
- 也可以保留手动触发 workflow 作为备用发布方式。

## 5. 站点信息架构

顶层导航采用简洁结构：

```text
首页
文章
关于
```

文章下分为三类：

```text
文章
├─ 长篇
├─ 短篇
└─ 记录
```

“记录”暂不支持子分类；等内容多了之后再拆分。当前记录只通过 tags 辅助组织。

## 6. URL 设计

推荐 URL：

```text
/                                      # 首页
/articles/                             # 文章总览
/articles/novels/                      # 长篇列表
/articles/novels/<novel-slug>/         # 长篇作品首页
/articles/novels/<novel-slug>/<volume-slug>/
/articles/novels/<novel-slug>/<volume-slug>/<chapter-slug>/

/articles/shorts/                      # 短篇列表
/articles/shorts/<short-slug>/          # 短篇阅读页

/articles/notes/                       # 记录列表
/articles/notes/<note-slug>/            # 记录阅读页
```

slug 规则：

- slug 来自目录名或文件名。
- frontmatter 中不额外要求写 `slug` 字段。
- 推荐使用英文小写、短横线连接，例如 `night-voyage`、`github-pages-debug`。

## 7. 内容仓库目录结构

`writings-public` 目标结构：

```text
writings-public/
├─ README.md
├─ novels/
│  └─ <novel-slug>/
│     ├─ index.md                 # 长篇作品首页 / 元信息
│     ├─ cover.jpg                # 可选：作品封面
│     └─ <volume-slug>/
│        ├─ index.md              # 卷首页 / 卷元信息
│        ├─ <chapter-slug>.md     # 章节正文
│        └─ <chapter-slug>/       # 可选：该章相关资源
│           └─ images/
├─ shorts/
│  ├─ <short-slug>.md             # 短篇正文
│  └─ <short-slug>/               # 可选：短篇资源目录
│     ├─ cover.jpg
│     └─ images/
└─ notes/
   ├─ <note-slug>.md              # 记录正文
   └─ <note-slug>/                # 可选：记录资源目录
      └─ images/
```

说明：

- 长篇作品和卷需要目录自身作为页面，因此使用 `index.md`。
- 长篇章节使用 `.md` 单文件。
- 短篇和记录使用 `.md` 单文件；如需封面或插图，放入同名资源目录。
- 图片和相关资源就近存放。
- `README.md` 必须清楚说明仓库用途、目录结构、frontmatter 规范、slug 规则、发布状态规则和图片资源规则。

## 8. 内容模型

### 8.1 长篇小说

长篇小说按“作品 → 卷 → 章”建模。

```text
长篇作品
  ├─ 卷
  │  ├─ 章
  │  └─ 章
  └─ 卷
     ├─ 章
     └─ 章
```

作品页来自：

```text
novels/<novel-slug>/index.md
```

卷页来自：

```text
novels/<novel-slug>/<volume-slug>/index.md
```

章节页来自：

```text
novels/<novel-slug>/<volume-slug>/<chapter-slug>.md
```

章节排序：

- 只依赖 frontmatter 中的 `chapter` 字段。
- 文件名建议带数字前缀，但不强制格式。
- 同一卷内 `chapter` 不应重复。

卷排序：

- 依赖卷 `index.md` frontmatter 中的 `volume` 字段。
- 同一长篇内 `volume` 不应重复。

### 8.2 短篇

短篇为独立文章。

正文文件：

```text
shorts/<short-slug>.md
```

资源目录，可选：

```text
shorts/<short-slug>/
```

### 8.3 记录

记录为普通文章。

正文文件：

```text
notes/<note-slug>.md
```

资源目录，可选：

```text
notes/<note-slug>/
```

记录暂不设置子分类字段，只使用 tags。

## 9. Frontmatter 规则

所有会发布的网站内容都使用 Markdown / MDX frontmatter。

### 9.1 通用字段

建议通用字段：

```yaml
title: 标题
status: published
summary: 简介，可选但推荐
date: 2026-07-04
tags:
  - 标签
cover: ./relative/path/to/cover.jpg
```

状态字段：

```yaml
status: published  # 正式发布，出现在网站
status: draft      # 草稿，不出现在网站
```

V1 只支持 `published` 和 `draft`。只有 `published` 会出现在网站中。

### 9.2 长篇作品 index.md

示例：

```yaml
title: 夜航
status: published
summary: 作品简介。
date: 2026-07-04
tags:
  - 长篇
cover: ./cover.jpg
```

### 9.3 卷 index.md

示例：

```yaml
title: 第一卷 海上的灯
status: published
volume: 1
summary: 第一卷简介。
```

### 9.4 章节 Markdown

示例：

```yaml
title: 第一章 夜航
status: published
chapter: 1
date: 2026-07-04
summary: 第一章简介。
```

章不需要额外写 `volume` 字段，因为它所属的卷由目录决定。

### 9.5 短篇 Markdown

示例：

```yaml
title: 夏雨
status: published
date: 2026-07-04
summary: 一个发生在雨天的故事。
tags:
  - 短篇
cover: ./summer-rain/cover.jpg
```

### 9.6 记录 Markdown

示例：

```yaml
title: GitHub Pages 部署踩坑
status: published
date: 2026-07-04
summary: 记录一次 GitHub Pages 部署失败的排查过程。
tags:
  - GitHub Pages
  - Astro
```

## 10. 图片和资源规则

- 支持可选封面图。
- 封面图通过 frontmatter 的 `cover` 字段指定。
- 正文插图使用 Markdown 图片语法。
- 图片优先就近放在文章或章节对应资源目录中。

示例：

```md
---
title: 夏雨
status: published
cover: ./summer-rain/cover.jpg
---

正文图片：

![雨中的街道](./summer-rain/images/street.jpg)
```

## 11. 阅读体验

长篇章节页需要支持连续阅读导航。

章节页底部显示：

```text
← 上一章
返回目录
下一章 →
```

规则：

- 根据卷排序和章排序自动计算上一篇 / 下一篇。
- 支持跨卷衔接。
- 例如第一卷最后一章的下一章可以指向第二卷第一章。

## 12. 主题模式

V1 支持浅色 / 暗色模式。

规则：

- 默认跟随系统主题。
- 页面提供主题切换入口。
- 用户选择应保存在浏览器本地，例如 `localStorage`。
- 主题切换完全在前端完成，不依赖后端。

## 13. V1 范围

V1 采用“完整但克制”的范围，并保持纯静态实现。

必须有：

- 首页
- 文章总览页
- 长篇列表页
- 长篇作品页
- 卷页
- 章节阅读页
- 上一章 / 返回目录 / 下一章
- 短篇列表页
- 短篇阅读页
- 记录列表页
- 记录阅读页
- 关于页
- tags 展示
- `published` / `draft` 过滤
- 浅色 / 暗色模式
- sitemap.xml
- rss.xml
- `writings-public` README 内容规范
- 自动部署

`sitemap.xml` 用于帮助搜索引擎发现站点页面；`rss.xml` 用于提供静态 RSS 订阅源，让读者通过 RSS 阅读器订阅更新。二者均在构建阶段静态生成，不需要后端。

暂不做：

- 全文搜索
- 评论系统
- 阅读进度同步
- 登录
- 订阅邮件
- 复杂图片管理
- 多语言
- 任何依赖站点自有后端或数据库的功能

## 14. 待讨论问题

后续继续按 grilling 方式逐项确认，并同步更新本文档。

当前待确认：

1. V1 第一版范围的剩余细节。
2. 首页展示内容与风格。
3. 标签页是否在 V1 实现的具体形式。
4. 是否使用 MDX，还是只支持 Markdown。
5. 站点视觉风格。
6. GitHub Actions 具体权限与 token 配置方案。
7. `writings-public` README 具体内容。

## 15. 文档同步规则

本设计文档是方案讨论的主记录。

之后每当设计达成新的明确结论，应同步更新本文件，保持实现前的设计依据清晰可追踪。

## 16. 决策记录

- 采用双仓库方案：内容仓库 `writings-public`，站点仓库 `belleangelina.github.io`。
- 站点仓库使用 public，可发布为 GitHub Pages 个人主站。
- 技术栈选择 Astro。
- GitHub Pages 仅托管静态网站，V1 按纯静态站点设计。
- 内容更新后自动触发网站重新构建和部署。
- 文章顶层分类为：长篇 / 短篇 / 记录。
- 记录暂不做子分类。
- 内容仓库目录需要整理，并在 README 中写清楚结构和规范。
- 使用 frontmatter 元数据。
- `status` 只支持 `published` / `draft`，仅 `published` 上站。
- 长篇按作品 / 卷 / 章建模。
- 长篇卷用目录，章用 `.md` 单文件。
- 短篇和记录用 `.md` 单文件，资源放同名目录。
- slug 由目录名 / 文件名决定，不额外写 `slug` 字段。
- 支持可选封面图和 Markdown 正文插图。
- 长篇章节页需要上一章 / 返回目录 / 下一章导航，并支持跨卷衔接。
- V1 支持浅色 / 暗色模式，默认跟随系统并允许用户切换。
- V1 包含静态生成的 `sitemap.xml` 和 `rss.xml`。
