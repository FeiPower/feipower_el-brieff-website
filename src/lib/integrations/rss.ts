import { site } from '../../config/site.ts';
import type { ContentItem } from '../editorial/contracts.ts';
import {
  articleCanonicalUrl,
  escapeXml,
  isValidArticleForSeo,
  markdownToSafeParagraphHtml,
} from '../editorial/seo.ts';

export type SyndicationRule =
  | 'exclude'
  | 'excerpt'
  | 'full_after_delay'
  | 'full';

export type FeedItemInput = {
  content: ContentItem;
  authorName: string;
  imageUrl?: string | null;
  syndicationRule?: SyndicationRule;
  bodyHtml?: string;
};

export function resolveFeedBody(input: {
  rule: SyndicationRule;
  summary: string;
  bodyHtml: string;
  publishedAt: string | null;
  now?: Date;
  delayHours?: number;
}): string | null {
  const { rule, summary, bodyHtml, publishedAt } = input;
  if (rule === 'exclude') {
    return null;
  }
  if (rule === 'excerpt') {
    return `<p>${escapeXml(summary)}</p>`;
  }
  if (rule === 'full') {
    return bodyHtml;
  }

  const delayHours = input.delayHours ?? 24;
  const now = input.now ?? new Date();
  if (!publishedAt) {
    return `<p>${escapeXml(summary)}</p>`;
  }
  const published = Date.parse(publishedAt);
  if (!Number.isFinite(published)) {
    return `<p>${escapeXml(summary)}</p>`;
  }
  if (now.getTime() - published >= delayHours * 60 * 60 * 1000) {
    return bodyHtml;
  }
  return `<p>${escapeXml(summary)}</p>`;
}

export function buildRssXml(input: {
  title: string;
  description: string;
  path: string;
  items: FeedItemInput[];
  includeFullBody: boolean;
}): string {
  const channelLink = new URL(input.path, site.siteUrl).href;
  const itemXml = input.items
    .filter((item) => isValidArticleForSeo(item.content))
    .map((item) => {
      const rule = item.syndicationRule ?? 'full';
      const bodyHtml =
        item.bodyHtml ??
        markdownToSafeParagraphHtml(item.content.bodyMarkdown);
      const description = input.includeFullBody
        ? resolveFeedBody({
            rule,
            summary: item.content.summary,
            bodyHtml,
            publishedAt: item.content.publishedAt,
          })
        : `<p>${escapeXml(item.content.summary)}</p>`;

      if (description === null) {
        return '';
      }

      const link =
        item.content.canonicalUrl ?? articleCanonicalUrl(item.content.slug);
      const image =
        item.imageUrl ?? new URL(site.ogImage, site.siteUrl).href;

      return `  <item>
    <title>${escapeXml(item.content.title)}</title>
    <link>${escapeXml(link)}</link>
    <guid isPermaLink="true">${escapeXml(link)}</guid>
    <pubDate>${escapeXml(
      item.content.publishedAt
        ? new Date(item.content.publishedAt).toUTCString()
        : '',
    )}</pubDate>
    <author>${escapeXml(item.authorName)}</author>
    <description><![CDATA[${description}]]></description>
    <enclosure url="${escapeXml(image)}" type="image/png" />
  </item>`;
    })
    .filter((block) => block.length > 0)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(input.title)}</title>
  <link>${escapeXml(channelLink)}</link>
  <description>${escapeXml(input.description)}</description>
  <language>es-mx</language>
${itemXml}
</channel>
</rss>`;
}
