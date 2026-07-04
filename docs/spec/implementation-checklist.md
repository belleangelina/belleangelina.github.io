# 实现闭环清单

本文件用于记录站点实现与部署验证状态，避免实现过程只依赖聊天上下文。

## 当前目标

实现一个可部署到 GitHub Pages 的 Astro 静态文章展示站。

目标网址：

```text
https://belleangelina.github.io/
```

## 当前约束

- 内容源：`belleangelina/writings`
- 站点仓库：`belleangelina/belleangelina.github.io`
- V1 只支持 Markdown `.md`
- V1 支持长篇、短篇、记录
- V1 必须适配移动端
- V1 支持浅色 / 暗色模式
- V1 生成 `rss.xml` 和 `sitemap.xml`
- 暂不要求跨仓库自动触发完全跑通，fine-grained PAT 后续再配置

## 实现计划

1. 初始化 Astro 项目文件。
2. 实现内容读取模块。
3. 实现基础布局、样式、暗色模式和响应式布局。
4. 实现首页、文章总览页、分类列表页和阅读页。
5. 实现长篇作品 / 卷 / 章页面和章节导航。
6. 实现 `rss.xml` 和 `sitemap.xml`。
7. 配置 GitHub Pages 部署 workflow。
8. 通过公开网址验证页面、链接和移动端基础布局。
9. 修复明显 bug。

## 当前状态

- [x] 设计文档已收束
- [x] `writings/README.md` 已更新
- [x] `short-stories/RainyGirl.md` 已迁移到 `shorts/RainyGirl.md`
- [ ] Astro 项目文件完整
- [ ] 内容读取模块完成
- [ ] 页面路由完成
- [ ] 移动端样式完成
- [ ] RSS / sitemap 完成
- [ ] GitHub Pages workflow 完成
- [ ] 公开网址验证完成

## 最新验证记录

尚未完成第一次部署验证。
