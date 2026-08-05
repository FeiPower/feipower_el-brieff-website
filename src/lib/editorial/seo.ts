import { site } from '../../config/site.ts';
import type { ContentItem } from './contracts.ts';

export type ArticleSeoInput = {
  content: ContentItem;
  authorName: string;
  imagePath?: string | null;
  dateModified?: string | null;
  type?: 'Article' | 'NewsArticle';
};

export type ArticleJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'Article' | 'NewsArticle';
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  image: string[];
  mainEntityOfPage: string;
  url: string;
  inLanguage: 'es-MX';
};

export function articleCanonicalPath(slug: string): string {
  const base = site.editorial.opinionBasePath.replace(/\/?$/, '/');
  return `${base}${slug}/`;
}

export function articleCanonicalUrl(slug: string): string {
  return new URL(articleCanonicalPath(slug), site.siteUrl).href;
}

export function isValidArticleForSeo(content: ContentItem): boolean {
  return (
    (content.status === 'published' || content.status === 'syndicated') &&
    Boolean(content.slug) &&
    Boolean(content.title) &&
    Boolean(content.summary) &&
    Boolean(content.publishedAt)
  );
}

export function isWithinNewsWindow(
  publishedAt: string,
  now = new Date(),
  hours = 48,
): boolean {
  const published = Date.parse(publishedAt);
  if (!Number.isFinite(published)) {
    return false;
  }
  const ageMs = now.getTime() - published;
  return ageMs >= 0 && ageMs <= hours * 60 * 60 * 1000;
}

export function buildArticleJsonLd(input: ArticleSeoInput): ArticleJsonLd {
  const { content, authorName } = input;
  if (!isValidArticleForSeo(content) || !content.publishedAt) {
    throw new Error('Article is not valid for SEO serialization');
  }

  const url = content.canonicalUrl ?? articleCanonicalUrl(content.slug);
  const imageUrl = new URL(input.imagePath ?? site.ogImage, site.siteUrl).href;
  const dateModified = input.dateModified ?? content.updatedAt;

  return {
    '@context': 'https://schema.org',
    '@type': input.type ?? 'NewsArticle',
    headline: content.title,
    description: content.summary,
    datePublished: content.publishedAt,
    dateModified,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: site.producer.name,
      logo: {
        '@type': 'ImageObject',
        url: new URL(site.ogImage, site.siteUrl).href,
      },
    },
    image: [imageUrl],
    mainEntityOfPage: url,
    url,
    inLanguage: 'es-MX',
  };
}

export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function markdownToSafeParagraphHtml(markdown: string): string {
  const blocks = markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  return blocks
    .map((block) => {
      const escaped = escapeXml(block).replaceAll('\n', '<br />');
      return `<p>${escaped}</p>`;
    })
    .join('\n');
}
