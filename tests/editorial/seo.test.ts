import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildArticleJsonLd,
  isWithinNewsWindow,
  isValidArticleForSeo,
} from '../../src/lib/editorial/seo.ts';
import type { ContentItem } from '../../src/lib/editorial/contracts.ts';

const published: ContentItem = {
  id: 'c1',
  kind: 'column',
  status: 'published',
  slug: 'demo',
  title: 'Titular visible',
  summary: 'Resumen visible en la página',
  bodyMarkdown: 'Cuerpo',
  authorId: 'arturo',
  publishedAt: '2026-08-04T12:00:00.000Z',
  updatedAt: '2026-08-04T13:00:00.000Z',
  canonicalUrl: 'https://el-brieff.strtgy.ai/opinion/demo/',
};

describe('editorial seo', () => {
  it('builds JSON-LD that matches visible article fields', () => {
    const jsonLd = buildArticleJsonLd({
      content: published,
      authorName: 'Arturo Salazar Bazúa',
    });

    assert.equal(jsonLd['@type'], 'NewsArticle');
    assert.equal(jsonLd.headline, published.title);
    assert.equal(jsonLd.description, published.summary);
    assert.equal(jsonLd.datePublished, published.publishedAt);
    assert.equal(jsonLd.dateModified, published.updatedAt);
    assert.equal(jsonLd.author.name, 'Arturo Salazar Bazúa');
    assert.equal(jsonLd.url, published.canonicalUrl);
  });

  it('limits news sitemap window to 48 hours', () => {
    const now = new Date('2026-08-04T18:00:00.000Z');
    assert.equal(
      isWithinNewsWindow('2026-08-03T10:00:00.000Z', now),
      true,
    );
    assert.equal(
      isWithinNewsWindow('2026-08-01T10:00:00.000Z', now),
      false,
    );
  });

  it('rejects unpublished items from SEO surfaces', () => {
    assert.equal(
      isValidArticleForSeo({ ...published, status: 'draft' }),
      false,
    );
  });
});
