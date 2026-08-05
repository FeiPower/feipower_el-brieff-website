import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { describe, it, beforeEach } from 'node:test';
import { EditorialRepository } from '../../src/lib/editorial/repository.ts';
import {
  ConflictStateError,
  assertEditorialTransition,
  assertPublishPrerequisites,
  canCreatePublicationRequest,
} from '../../src/lib/editorial/validation.ts';

type StatementLike = {
  bind: (...values: unknown[]) => StatementLike;
  first: <T = unknown>() => Promise<T | null>;
  all: <T = unknown>() => Promise<{ results: T[] }>;
  run: () => Promise<{ success: boolean }>;
};

function createSqliteD1(db: DatabaseSync) {
  return {
    prepare(query: string): StatementLike {
      let bound: unknown[] = [];
      const statement: StatementLike = {
        bind(...values: unknown[]) {
          bound = values;
          return statement;
        },
        async first<T = unknown>() {
          const row = db.prepare(query).get(...bound) as T | undefined;
          return row ?? null;
        },
        async all<T = unknown>() {
          const rows = db.prepare(query).all(...bound) as T[];
          return { results: rows };
        },
        async run() {
          db.prepare(query).run(...bound);
          return { success: true };
        },
      };
      return statement;
    },
  };
}

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const migrationSql = readFileSync(
  join(root, 'migrations/0001_editorial.sql'),
  'utf8',
);

describe('editorial publish transitions', () => {
  let repository: EditorialRepository;

  beforeEach(() => {
    const db = new DatabaseSync(':memory:');
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec(migrationSql);
    repository = new EditorialRepository(createSqliteD1(db));
  });

  it('rejects incomplete publish prerequisites', async () => {
    await repository.ensureAuthor({ id: 'a1', name: 'Arturo' });
    const content = await repository.createContentItem(
      {
        id: 'c1',
        kind: 'column',
        status: 'approved',
        slug: 'incompleta',
        title: 'Titulo',
        summary: 'Resumen suficiente',
        bodyMarkdown: 'Cuerpo suficiente para publicar',
        authorId: 'a1',
      },
      'a1',
    );

    assert.throws(
      () =>
        assertPublishPrerequisites(content, {
          category: null,
          disclosure: null,
          featuredAssetId: null,
          citations: [],
        }),
      ConflictStateError,
    );
  });

  it('allows approved to published only with citations and metadata', async () => {
    await repository.ensureAuthor({ id: 'a1', name: 'Arturo' });
    const content = await repository.createContentItem(
      {
        id: 'c1',
        kind: 'column',
        status: 'approved',
        slug: 'completa',
        title: 'Titulo completo',
        summary: 'Resumen suficientemente largo',
        bodyMarkdown: 'Cuerpo editorial con extensión adecuada',
        authorId: 'a1',
      },
      'a1',
    );

    await repository.ensureSource({
      id: 's1',
      title: 'Fuente',
      sourceUrl: 'https://example.com/fuente',
      approved: true,
    });
    await repository.addCitation(
      {
        id: 'cite1',
        contentItemId: content.id,
        sourceId: 's1',
        claim: 'Hecho verificable',
        excerpt: 'Extracto de la fuente',
        sourceUrl: 'https://example.com/fuente',
        verifiedAt: new Date().toISOString(),
      },
      'a1',
    );
    await repository.ensureAsset({
      id: 'asset1',
      contentItemId: content.id,
      r2Key: 'assets/asset1.png',
      contentType: 'image/png',
    });
    await repository.setPublishMetadata(
      content.id,
      {
        category: 'opinion',
        disclosure: 'Opinión del conductor',
        featuredAssetId: 'asset1',
      },
      'a1',
    );

    const citations = await repository.listCitations(content.id);
    const metadata = await repository.getPublishMetadata(content.id);
    assertPublishPrerequisites(content, {
      category: metadata.category,
      disclosure: metadata.disclosure,
      featuredAssetId: metadata.featuredAssetId,
      citations,
    });

    assert.equal(canCreatePublicationRequest('approved', 'published'), true);
    assertEditorialTransition('approved', 'published');

    const published = await repository.updateContentItem(
      content.id,
      {
        status: 'published',
        publishedAt: new Date().toISOString(),
        canonicalUrl: 'https://el-brieff.strtgy.ai/opinion/completa/',
      },
      'a1',
    );
    assert.equal(published.status, 'published');

    const publication = await repository.createPublicationRequest(
      {
        id: 'pub1',
        contentItemId: published.id,
        channel: 'linkedin',
        payloadVersion: 1,
        approvalState: 'needs_approval',
        idempotencyKey: 'pub-completa-linkedin',
      },
      'a1',
    );
    assert.equal(publication.approvalState, 'needs_approval');
  });

  it('blocks illegal transitions', () => {
    assert.throws(
      () => assertEditorialTransition('idea', 'published'),
      ConflictStateError,
    );
  });
});
