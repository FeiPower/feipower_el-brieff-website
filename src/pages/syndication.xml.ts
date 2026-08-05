import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { site } from '../config/site';
import { EditorialRepository } from '../lib/editorial/repository.ts';
import { buildRssXml } from '../lib/integrations/rss.ts';
import { isValidArticleForSeo } from '../lib/editorial/seo.ts';

export const prerender = false;

export const GET: APIRoute = async () => {
  const repository = new EditorialRepository(env.EDITORIAL_DB);
  const published = (await repository.listPublishedByKind('column')).filter(
    isValidArticleForSeo,
  );

  const items = [];
  for (const content of published) {
    const rule = await repository.getSyndicationRule(content.id);
    if (rule === 'exclude') {
      continue;
    }
    items.push({
      content,
      authorName: site.host.name,
      syndicationRule: rule,
    });
  }

  const body = buildRssXml({
    title: `${site.name} — Syndication`,
    description:
      'Feed de socios aprobados. Las copias completas deben usar noindex en el destino.',
    path: '/syndication.xml',
    items,
    includeFullBody: true,
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Robots-Tag': 'noindex',
    },
  });
};
