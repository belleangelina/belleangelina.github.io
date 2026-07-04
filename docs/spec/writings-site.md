# 文章展示网站设计文档

## 1. 背景

本项目用于构建一个发布到 GitHub Pages 的个人文章展示网站，用来展示 `belleangelina/writings` 仓库中的公开文章。

当前内容以小说为主，包括长篇和短篇；同时也会包含开发调试经验、记录。后续可能扩展更多文章类型。

说明：内容仓库原名为 `writings-public`，现已改名为 `writings`。本文档后续统一使用新仓库名 `belleangelina/writings`。

## 2. 仓库分工

采用双仓库方案。

- 内容仓库：`belleangelina/writings`
  - 存放文章 Markdown、封面、插图和相关资源。
  - 作为网站内容源。
  - 已确认是 public 仓库，默认分支为 `main`。

- 站点仓库：`belleangelina/belleangelina.github.io`
  - 存放 Astro 网站代码、构建脚本、部署 workflow 和设计文档。
  - 发布到 GitHub Pages。
  - 对应站点地址：`https://belleangelina.github.io/`
  - 已确认是 public 仓库，默认分支为 `main`。

选择该方案的原因：内容和网站实现解耦；`writings` 只负责写作内容，`belleangelina.github.io` 只负责展示、构建和发布。

## 3. 技术栈

站点使用 Astro。

理由：

- 更适合文章、小说、记录类静态内容站。
- 支持 Markdown。
- 适合用 Content Collections 或自定义内容加载逻辑管理 frontmatter。
- 可以静态构建并部署到 GitHub Pages。

### 3.1 GitHub Pages 静态约束

GitHub Pages 只托管静态网站。站点应在 GitHub Actions 构建阶段把 Markdown 内容转换为静态 HTML、CSS 和 JavaScript，然后由 GitHub Pages 发布。

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
- 本地搜索索引，如果后续需要
- 暗色模式
- 阅读进度等本地状态
- 从公开 API 拉取公开数据，如果后续需要

设计结论：V1 应按纯静态站点设计。评论、登录、服务端搜索、在线编辑、订阅邮件等需要服务端或外部服务的能力，不进入核心范围。

### 3.2 内容文件格式

V1 只支持 Markdown 文件，即 `.md`。

V1 暂不支持 MDX `.mdx`。原因是当前内容主要是小说、短篇和记录，Markdown 已能满足正文、标题、列表、引用、代码块、图片等需求。MDX 可以在文章中嵌入组件，但会增加写作复杂度、构建复杂度和内容约束，暂不进入第一版。

## 4. 发布流程

采用自动触发 + 手动触发备用。

目标流程：

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

同时，站点仓库 `belleangelina.github.io` 应保留 `workflow_dispatch` 手动触发入口，用于自动触发失败、调试部署或临时重建站点。

### 4.1 跨仓库触发凭证

跨仓库触发使用 fine-grained PAT。

配置方案：

- 创建一个 fine-grained personal access token。
- token 只授权给目标站点仓库：`belleangelina/belleangelina.github.io`。
- token 权限只给触发 `repository_dispatch` 所需的最小权限，目标为能向站点仓库发送 dispatch 事件。
- 将 token 存入内容仓库 `belleangelina/writings` 的 GitHub Actions secret。
- 推荐 secret 名称：`SITE_REPO_DISPATCH_TOKEN`。
- 内容仓库 workflow 在 push 到 `main` 后，使用该 secret 调用 GitHub API，向 `belleangelina.github.io` 发送 `repository_dispatch` 事件。

站点仓库 workflow 触发方式：

```yaml
on:
  repository_dispatch:
    types: [content-updated]
  workflow_dispatch:
```

内容仓库 workflow 触发方式：

```yaml
on:
  push:
    branches: [main]
```

该方案适合个人 public 仓库，配置直接，权限边界清晰。后续如果需要更严格的组织级权限治理，再考虑改为 GitHub App。

约束和注意事项：

- 两个仓库都使用 public 仓库，适配 GitHub 免费账户。
- 跨仓库触发需要配置 token 或其他可触发 `repository_dispatch` 的权限机制。
- 自动发布由内容仓库 push 触发，手动发布作为备用路径。

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

“记录”暂不支持子分类；等内容多了之后再拆分。V1 中记录只作为一种文章类型展示，不再额外引入标签系统。

## 6. 首页定位

首页作为入口页，不作为完整文章列表页。

首页应承担三个角色：

- 简要说明这个网站是什么。
- 提供长篇、短篇、记录三个核心入口。
- 展示最近更新的少量内容，引导读者进入完整列表或阅读页。

推荐首页结构：

```text
网站标题 / 简短介绍

主要入口
├─ 长篇
├─ 短篇
└─ 记录

最近更新
├─ 最近更新 1
├─ 最近更新 2
└─ 最近更新 3
```

完整文章列表不放在首页，而放在：

```text
/articles/
/articles/novels/
/articles/shorts/
/articles/notes/
```

## 7. URL 设计

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

V1 不提供 `/tags/` 或 `/tags/<tag>/` 标签页。

slug 规则：

- slug 来自目录名或文件名。
- frontmatter 中不额外要求写 `slug` 字段。
- 推荐使用英文小写、短横线连接，例如 `night-voyage`、`github-pages-debug`。

## 8. 内容仓库目录结构

`writings` 目标结构：

```text
writings/
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
- `README.md` 已更新为内容仓库规范说明，覆盖仓库用途、目录结构、frontmatter、slug、发布状态、图片资源和自动发布概览。

## 9. 内容模型

### 9.1 长篇小说

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

### 9.2 短篇

短篇为独立文章。

正文文件：

```text
shorts/<short-slug>.md
```

资源目录，可选：

```text
shorts/<short-slug>/
```

### 9.3 记录

记录为普通文章。

正文文件：

```text
notes/<note-slug>.md
```

资源目录，可选：

```text
notes/<note-slug>/
```

记录暂不设置子分类，也不在 V1 使用 tags 字段。

## 10. Frontmatter 规则

所有会发布的网站内容都使用 Markdown frontmatter。

### 10.1 通用字段

V1 通用字段：

```yaml
title: 标题
status: published
summary: 简介，可选但推荐
date: 2026-07-04
cover: ./relative/path/to/cover.jpg
```

状态字段：

```yaml
status: published  # 正式发布，出现在网站
status: draft      # 草稿，不出现在网站
```

V1 只支持 `published` 和 `draft`。只有 `published` 会出现在网站中。

V1 暂不使用 `tags` 字段，也不生成标签页。后续如果内容规模变大，再重新讨论标签系统。

### 10.2 长篇作品 index.md

示例：

```yaml
title: 夜航
status: published
summary: 作品简介。
date: 2026-07-04
cover: ./cover.jpg
```

### 10.3 卷 index.md

示例：

```yaml
title: 第一卷 海上的灯
status: published
volume: 1
summary: 第一卷简介。
```

### 10.4 章节 Markdown

示例：

```yaml
title: 第一章 夜航
status: published
chapter: 1
date: 2026-07-04
summary: 第一章简介。
```

章不需要额外写 `volume` 字段，因为它所属的卷由目录决定。

### 10.5 短篇 Markdown

示例：

```yaml
title: 夏雨
status: published
date: 2026-07-04
summary: 一个发生在雨天的故事。
cover: ./summer-rain/cover.jpg
```

### 10.6 记录 Markdown

示例：

```yaml
title: GitHub Pages 部署踩坑
status: published
date: 2026-07-04
summary: 记录一次 GitHub Pages 部署失败的排查过程。
```

## 11. 图片和资源规则

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

## 12. 阅读体验

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

## 13. 主题模式

V1 支持浅色 / 暗色模式。

规则：

- 默认跟随系统主题。
- 页面提供主题切换入口。
- 用户选择应保存在浏览器本地，例如 `localStorage`。
- 主题切换完全在前端完成，不依赖后端。

## 14. 视觉风格

V1 采用极简文学阅读风格。

设计重点：

- 以文字阅读体验为核心。
- 页面留白充足。
- 正文字号舒适，行距偏宽，适合长篇阅读。
- 视觉装饰克制，不使用复杂卡片、强阴影或高饱和装饰。
- 封面图可展示，但不喧宾夺主。
- 列表页清晰、安静，优先显示标题、日期、简介等信息。
- 章节阅读页应尽量减少干扰，导航清楚但不过度突出。

整体气质偏“文学阅读站”，而不是开发者博客或视觉作品集。

## 15. 排序规则

V1 使用默认、直观的排序规则，不再作为单独设计争议项。

规则：

- 文章总览页按 `date` 倒序展示，即新内容在前。
- 短篇列表页按 `date` 倒序展示。
- 记录列表页按 `date` 倒序展示。
- 长篇列表页按作品 `date` 倒序展示。
- 长篇作品内部按卷和章的自然阅读顺序展示：卷按 `volume` 升序，章按 `chapter` 升序。
- 首页“最近更新”按内容更新时间或发布日期倒序取少量条目；实现时优先使用 `date`。

## 16. V1 范围

V1 采用“完整但克制”的范围，并保持纯静态实现。

必须有：

- 首页作为入口页：简介、分类入口、最近更新
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
- 极简文学阅读风格
- 默认排序规则：列表页按日期倒序，长篇内部按卷章顺序
- 只支持 Markdown `.md` 内容文件
- `published` / `draft` 过滤
- 浅色 / 暗色模式
- sitemap.xml
- rss.xml
- `writings` README 内容规范
- 自动部署 + 手动触发备用
- 使用 fine-grained PAT 完成跨仓库 `repository_dispatch`

`sitemap.xml` 用于帮助搜索引擎发现站点页面；`rss.xml` 用于提供静态 RSS 订阅源，让读者通过 RSS 阅读器订阅更新。二者均在构建阶段静态生成，不需要后端。

暂不做：

- MDX `.mdx`
- tags 字段
- 标签列表页
- 标签详情页
- 全文搜索
- 评论系统
- 阅读进度同步
- 登录
- 订阅邮件
- 复杂图片管理
- 多语言
- 任何依赖站点自有后端或数据库的功能

## 17. 待讨论问题

后续继续按 grilling 方式逐项确认，并同步更新本文档。

为避免把“基操”当成关键设计点，后续只单独确认会影响以下内容的问题：架构边界、写作流程、内容规范、URL 结构、部署权限、长期维护成本或明显的用户体验取舍。默认实现约定直接采用推荐方案并记录到本文档。

当前主要设计项已确认。下一步可以进入实现：初始化 Astro 站点、配置内容读取、生成页面路由、配置自动部署 workflow，并根据实现过程继续补充本文档。

## 18. 文档同步规则

本设计文档是方案讨论的主记录。

之后每当设计达成新的明确结论，应同步更新本文件，保持实现前的设计依据清晰可追踪。

## 19. 决策记录

- 内容仓库已从 `belleangelina/writings-public` 改名为 `belleangelina/writings`。
- 采用双仓库方案：内容仓库 `writings`，站点仓库 `belleangelina.github.io`。
- 站点仓库使用 public，可发布为 GitHub Pages 个人主站。
- 技术栈选择 Astro。
- GitHub Pages 仅托管静态网站，V1 按纯静态站点设计。
- 内容文件 V1 只支持 Markdown `.md`，暂不支持 MDX `.mdx`。
- 内容更新后自动触发网站重新构建和部署。
- 自动部署采用 `writings` push 后触发 `belleangelina.github.io` 的 `repository_dispatch`；站点仓库同时保留 `workflow_dispatch` 手动触发备用。
- 跨仓库触发使用 fine-grained PAT，作为 secret 存入 `writings`，推荐名称为 `SITE_REPO_DISPATCH_TOKEN`。
- `writings/README.md` 已更新为内容仓库规范说明。
- 首页作为入口页，不作为完整文章列表页。
- 站点视觉采用极简文学阅读风格。
- 文章列表页按 `date` 倒序；长篇内部按 `volume` / `chapter` 升序。
- 文章顶层分类为：长篇 / 短篇 / 记录。
- 记录暂不做子分类。
- V1 暂不使用 `tags` 字段，也不做标签列表页或标签详情页。
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
