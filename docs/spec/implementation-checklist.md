# 实现状态

## 最近验证

2026-07-11 使用 `WRITINGS_CONTENT_DIR=../writings` 执行完整验证：

- `npm run check`：20 个 Astro/TypeScript 文件，0 error、0 warning、0 hint。
- `npm run build`：成功生成 15 个页面。
- `npm run audit:site`：15 个 canonical 全部匹配，内部链接、sitemap、RSS、robots 和 favicon 检查通过。
- 浏览器验证：桌面端与 375px 移动端无横向溢出；长篇阅读记录、卷折叠、章节三等分导航、主题切换和键盘焦点状态正常。
- `npm audit`：0 个已知漏洞。

## 自动验证

- 本地提交前运行 `npm run verify`。
- `agent/**` 分支和 Pull Request 由 `Validate site` workflow 执行相同验证。
- `main` 部署由 `Deploy site` workflow 使用 `npm ci` 后执行相同验证，通过后才上传 Pages 产物。

## 仍需外部验证

- 优化分支推送后确认 `Validate site` 远端运行成功。
- 合并到 `main` 后确认 GitHub Pages 部署成功，并抽查线上 canonical、长篇继续阅读和 RSS。
