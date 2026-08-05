import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { site } from '../config/site';
import { EditorialRepository } from '../lib/editorial/repository.ts';
import {
  articleCanonicalUrl,
  escapeXml,
  isValidArticleForSeo,
} from '../lib/editorial/seo.ts';

export const prerender = false;

export const GET: APIRoute = async () => {
  const repository = new EditorialRepository(env.EDITORIAL_DB);
  const articles = (await repository.listPublishedByKind('column')).filter(
    isValidArticleForSeo,
  );

  const staticPaths = ['/', '/about/', '/media-kit/', '/opinion/'];
  const urls = [
    ...staticPaths.map((path) => new URL(path, site.siteUrl).href),
    ...articles.map((item) => articleCanonicalUrl(item.slug)),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${escapeXml(loc)}</loc>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
