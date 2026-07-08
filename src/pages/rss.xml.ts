import { getAllPublishedArticles, siteUrl } from '../lib/content';

export const prerender = true;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const articles = await getAllPublishedArticles();
  const items = articles.map((article) => {
    const url = siteUrl(article.url);
    const pubDate = article.date ? new Date(`${article.date}T00:00:00Z`).toUTCString() : new Date().toUTCString();

    return `
      <item>
        <title>${escapeXml(article.title)}</title>
        <link>${escapeXml(url)}</link>
        <guid>${escapeXml(url)}</guid>
        <pubDate>${escapeXml(pubDate)}</pubDate>
        <description>${escapeXml(article.summary || article.title)}</description>
      </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>天然未来派的摸鱼小屋</title>
    <link>${siteUrl('/')}</link>
    <description>个人文章、小说和记录。</description>
    <language>zh-CN</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
}
