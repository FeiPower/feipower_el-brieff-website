import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { site } from '../config/site';
import { EditorialRepository } from '../lib/editorial/repository.ts';
import { buildRssXml } from '../lib/integrations/rss.ts';
import { isValidArticleForSeo } from '../lib/editorial/seo.ts';

export const prerender = false;

export const GET: APIRoute = async () => {
  const repository = new EditorialRepository(env.EDITORIAL_DB);
  const items = (await repository.listPublishedByKind('column'))
    .filter(isValidArticleForSeo)
    .map((content) => ({
      content,
      authorName: site.host.name,
      syndicationRule: 'full' as const,
    }));

  const body = buildRssXml({
    title: `${site.name} — Opinión`,
    description: 'Columnas publicadas de El Brieff',
    path: '/rss.xml',
    items,
    includeFullBody: true,
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
