import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { getEditorialRepository } from '../lib/editorial/runtime.ts';
import { buildRssXml } from '../lib/integrations/rss.ts';
import { isValidArticleForSeo } from '../lib/editorial/seo.ts';

export const prerender = false;

export const GET: APIRoute = async () => {
  const repository = getEditorialRepository();
  const items = repository
    ? (await repository.listPublishedByKind('column'))
        .filter(isValidArticleForSeo)
        .map((content) => ({
          content,
          authorName: site.host.name,
          syndicationRule: 'full' as const,
        }))
    : [];

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
