import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';
import { marked } from 'marked';

export type ArticleKind = 'short' | 'note' | 'chapter';

export interface BaseEntry {
  title: string;
  status: string;
  summary: string;
  date: string;
  cover?: string;
  slug: string;
  url: string;
  sourcePath: string;
}

export interface Article extends BaseEntry {
  kind: ArticleKind;
  html: string;
}

export interface Volume extends BaseEntry {
  volume: number;
  chapters: Article[];
}

export interface Novel extends BaseEntry {
  volumes: Volume[];
}

const CONTENT_ROOT = path.resolve(process.cwd(), process.env.WRITINGS_CONTENT_DIR ?? 'writings-content');
const SITE_URL = 'https://belleangelina.github.io';

function isPublished(data: Record<string, unknown>) {
  return data.status === 'published';
}

function toDateString(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'string' && value.trim()) {
    return value.slice(0, 10);
  }

  return '';
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function sortByDateDesc<T extends { date: string; title: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return a.title.localeCompare(b.title);
  });
}

function publicAssetUrl(sourcePath: string, rawPath: unknown): string | undefined {
  if (typeof rawPath !== 'string' || !rawPath.trim()) return undefined;

  const value = rawPath.trim();
  if (/^(https?:)?\/\//.test(value) || value.startsWith('/')) return value;

  const absolute = path.resolve(path.dirname(sourcePath), value);
  const relative = path.relative(CONTENT_ROOT, absolute).split(path.sep).join('/');
  if (relative.startsWith('..')) return value;

  return `/content/${relative}`;
}

function rewriteMarkdownAssetUrls(markdown: string, sourcePath: string): string {
  return markdown.replace(/(!\[[^\]]*\]\()([^)#][^)]+)(\))/g, (match, prefix, rawUrl, suffix) => {
    const trimmed = String(rawUrl).trim();
    if (/^(https?:)?\/\//.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('#')) {
      return match;
    }

    const [pathname, hash] = trimmed.split('#');
    const [assetPath, query] = pathname.split('?');
    const resolved = publicAssetUrl(sourcePath, assetPath);
    if (!resolved) return match;

    const nextUrl = `${resolved}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
    return `${prefix}${nextUrl}${suffix}`;
  });
}

async function readMarkdown(sourcePath: string, fallbackSlug: string, url: string, kind?: ArticleKind): Promise<Article | BaseEntry | null> {
  const raw = await fs.readFile(sourcePath, 'utf8');
  const parsed = matter(raw);

  if (!isPublished(parsed.data)) return null;

  const title = typeof parsed.data.title === 'string' && parsed.data.title.trim() ? parsed.data.title.trim() : fallbackSlug;
  const summary = typeof parsed.data.summary === 'string' ? parsed.data.summary : '';
  const date = toDateString(parsed.data.date);
  const cover = publicAssetUrl(sourcePath, parsed.data.cover);
  const slug = fallbackSlug;

  const base: BaseEntry = {
    title,
    status: 'published',
    summary,
    date,
    cover,
    slug,
    url,
    sourcePath
  };

  if (!kind) return base;

  const markdown = rewriteMarkdownAssetUrls(parsed.content, sourcePath);
  const html = String(await marked.parse(markdown));

  return {
    ...base,
    kind,
    html
  };
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  return fg('*.md', { cwd: dir, onlyFiles: true, absolute: true });
}

async function listDirectories(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(dir, entry.name));
}

function basenameWithoutExt(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

export async function getPublishedShorts(): Promise<Article[]> {
  const dir = path.join(CONTENT_ROOT, 'shorts');
  const files = await listMarkdownFiles(dir);
  const articles = await Promise.all(files.map(async (file) => {
    const slug = basenameWithoutExt(file);
    return readMarkdown(file, slug, `/articles/shorts/${slug}/`, 'short');
  }));

  return sortByDateDesc(articles.filter(Boolean) as Article[]);
}

export async function getPublishedNotes(): Promise<Article[]> {
  const dir = path.join(CONTENT_ROOT, 'notes');
  const files = await listMarkdownFiles(dir);
  const articles = await Promise.all(files.map(async (file) => {
    const slug = basenameWithoutExt(file);
    return readMarkdown(file, slug, `/articles/notes/${slug}/`, 'note');
  }));

  return sortByDateDesc(articles.filter(Boolean) as Article[]);
}

export async function getPublishedNovels(): Promise<Novel[]> {
  const novelsDir = path.join(CONTENT_ROOT, 'novels');
  const novelDirs = await listDirectories(novelsDir);

  const novels = await Promise.all(novelDirs.map(async (novelDir) => {
    const novelSlug = path.basename(novelDir);
    const novelIndex = path.join(novelDir, 'index.md');
    if (!existsSync(novelIndex)) return null;

    const novelBase = await readMarkdown(novelIndex, novelSlug, `/articles/novels/${novelSlug}/`);
    if (!novelBase) return null;

    const volumeDirs = await listDirectories(novelDir);
    const volumes = await Promise.all(volumeDirs.map(async (volumeDir) => {
      const volumeSlug = path.basename(volumeDir);
      const volumeIndex = path.join(volumeDir, 'index.md');
      if (!existsSync(volumeIndex)) return null;

      const volumeBase = await readMarkdown(volumeIndex, volumeSlug, `/articles/novels/${novelSlug}/${volumeSlug}/`);
      if (!volumeBase) return null;

      const rawVolume = matter(await fs.readFile(volumeIndex, 'utf8')).data.volume;
      const chapterFiles = (await listMarkdownFiles(volumeDir)).filter((file) => path.basename(file) !== 'index.md');
      const chapters = await Promise.all(chapterFiles.map(async (file) => {
        const chapterSlug = basenameWithoutExt(file);
        return readMarkdown(file, chapterSlug, `/articles/novels/${novelSlug}/${volumeSlug}/${chapterSlug}/`, 'chapter');
      }));

      const publishedChapters = (chapters.filter(Boolean) as Article[]).sort((a, b) => {
        const aData = matter(fsSyncRead(a.sourcePath)).data;
        const bData = matter(fsSyncRead(b.sourcePath)).data;
        return toNumber(aData.chapter) - toNumber(bData.chapter) || a.title.localeCompare(b.title);
      });

      return {
        ...volumeBase,
        volume: toNumber(rawVolume),
        chapters: publishedChapters
      } as Volume;
    }));

    const publishedVolumes = (volumes.filter(Boolean) as Volume[]).sort((a, b) => a.volume - b.volume || a.title.localeCompare(b.title));

    return {
      ...novelBase,
      volumes: publishedVolumes
    } as Novel;
  }));

  return sortByDateDesc(novels.filter(Boolean) as Novel[]);
}

function fsSyncRead(filePath: string): string {
  return require('node:fs').readFileSync(filePath, 'utf8');
}

export async function getAllPublishedArticles(): Promise<Article[]> {
  const [shorts, notes, novels] = await Promise.all([
    getPublishedShorts(),
    getPublishedNotes(),
    getPublishedNovels()
  ]);

  const chapters = novels.flatMap((novel) => novel.volumes.flatMap((volume) => volume.chapters));
  return sortByDateDesc([...shorts, ...notes, ...chapters]);
}

export async function getRecentArticles(limit = 5): Promise<Article[]> {
  return (await getAllPublishedArticles()).slice(0, limit);
}

export async function getSitemapUrls(): Promise<string[]> {
  const [shorts, notes, novels] = await Promise.all([
    getPublishedShorts(),
    getPublishedNotes(),
    getPublishedNovels()
  ]);

  const urls = new Set<string>([
    '/',
    '/articles/',
    '/articles/novels/',
    '/articles/shorts/',
    '/articles/notes/',
    '/about/'
  ]);

  shorts.forEach((item) => urls.add(item.url));
  notes.forEach((item) => urls.add(item.url));
  novels.forEach((novel) => {
    urls.add(novel.url);
    novel.volumes.forEach((volume) => {
      urls.add(volume.url);
      volume.chapters.forEach((chapter) => urls.add(chapter.url));
    });
  });

  return [...urls].map((url) => new URL(url, SITE_URL).toString());
}

export function siteUrl(pathname = '/') {
  return new URL(pathname, SITE_URL).toString();
}
