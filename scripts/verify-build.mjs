import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';

const SITE_URL = 'https://belleangelina.github.io';
const DIST_ROOT = path.resolve(process.cwd(), 'dist');
const errors = [];

function report(file, message) {
  errors.push(`${file}: ${message}`);
}

function routeForHtml(file) {
  const normalized = file.split(path.sep).join('/');
  if (normalized === 'index.html') return '/';
  return `/${normalized.replace(/index\.html$/, '')}`;
}

function internalTarget(href) {
  if (!href.startsWith('/') || href.startsWith('//')) return null;

  const pathname = new URL(href, SITE_URL).pathname;
  const relative = pathname.replace(/^\//, '');
  if (!relative) return path.join(DIST_ROOT, 'index.html');
  if (pathname.endsWith('/')) return path.join(DIST_ROOT, relative, 'index.html');
  return path.join(DIST_ROOT, relative);
}

if (!existsSync(DIST_ROOT)) {
  throw new Error('dist 不存在，请先执行 npm run build。');
}

const htmlFiles = await fg('**/*.html', { cwd: DIST_ROOT, onlyFiles: true });
const sitemapPath = path.join(DIST_ROOT, 'sitemap.xml');
const rssPath = path.join(DIST_ROOT, 'rss.xml');
const sitemap = await fs.readFile(sitemapPath, 'utf8');
const canonicalUrls = new Set();

for (const file of htmlFiles) {
  const sourcePath = path.join(DIST_ROOT, file);
  const html = await fs.readFile(sourcePath, 'utf8');
  const route = routeForHtml(file);
  const expectedCanonical = new URL(route, SITE_URL).toString();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const ids = [...html.matchAll(/\sid="([^"]+)"/gi)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

  if (!/<html lang="zh-CN"/i.test(html)) report(file, '缺少 zh-CN 页面语言。');
  if (!/<meta name="description" content="[^"]+"/i.test(html)) report(file, '缺少非空 description。');
  if (canonical !== expectedCanonical) report(file, `canonical 应为 ${expectedCanonical}。`);
  if (!/<meta property="og:url" content="[^"]+"/i.test(html)) report(file, '缺少 og:url。');
  if (h1Count !== 1) report(file, `应有且仅有一个 h1，当前为 ${h1Count}。`);
  if (duplicateIds.length > 0) report(file, `存在重复 id：${[...new Set(duplicateIds)].join(', ')}。`);
  if (!sitemap.includes(`<loc>${expectedCanonical}</loc>`)) report(file, 'sitemap 缺少页面 canonical。');

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt="[^"]*"/i.test(match[1])) report(file, '存在缺少 alt 的图片。');
  }

  for (const match of html.matchAll(/\shref="([^"]+)"/gi)) {
    const href = match[1].replace(/&amp;/g, '&');
    const target = internalTarget(href);
    if (target && !existsSync(target)) report(file, `内部链接目标不存在：${href}。`);
  }

  canonicalUrls.add(expectedCanonical);
}

const rss = await fs.readFile(rssPath, 'utf8');
if (!rss.includes('rel="self"')) report('rss.xml', '缺少 Atom self link。');
if (rss.includes('Invalid Date')) report('rss.xml', '包含无效发布日期。');
if (!existsSync(path.join(DIST_ROOT, 'robots.txt'))) report('robots.txt', '构建产物缺少 robots.txt。');
if (!existsSync(path.join(DIST_ROOT, 'favicon.svg'))) report('favicon.svg', '构建产物缺少 favicon.svg。');

if (errors.length > 0) {
  console.error(`[verify-build] 发现 ${errors.length} 个问题：`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`[verify-build] 通过：${htmlFiles.length} 个 HTML 页面，${canonicalUrls.size} 个 canonical，内部链接与发现文件正常。`);
}
