import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { getEditorialRepository } from '../lib/editorial/runtime.ts';
import { buildRssXml } from '../lib/integrations/rss.ts';
import { isValidArticleForSeo } from '../lib/editorial/seo.ts';

export const prerender = false;

export const GET: APIRoute = async () => {
  const repository = getEditorialRepository();
  const items = [];

  if (repository) {
    const published = (await repository.listPublishedByKind('column')).filter(
      isValidArticleForSeo,
    );
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
