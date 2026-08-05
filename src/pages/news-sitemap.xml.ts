import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { getEditorialRepository } from '../lib/editorial/runtime.ts';
import {
  articleCanonicalUrl,
  escapeXml,
  isValidArticleForSeo,
  isWithinNewsWindow,
} from '../lib/editorial/seo.ts';

export const prerender = false;

export const GET: APIRoute = async () => {
  const repository = getEditorialRepository();
  const now = new Date();
  const articles = repository
    ? (await repository.listPublishedByKind('column')).filter(
        (item) =>
          isValidArticleForSeo(item) &&
          item.publishedAt !== null &&
          isWithinNewsWindow(item.publishedAt, now),
      )
    : [];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles
  .map((item) => {
    const loc = articleCanonicalUrl(item.slug);
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(site.name)}</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(item.publishedAt ?? '')}</news:publication_date>
      <news:title>${escapeXml(item.title)}</news:title>
    </news:news>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
