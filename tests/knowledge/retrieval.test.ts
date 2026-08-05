import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { describe, it, beforeEach } from 'node:test';
import { EditorialRepository } from '../../src/lib/editorial/repository.ts';
import {
  assertIngestAllowed,
  ingestKnowledgeDocument,
} from '../../src/lib/knowledge/catalog.ts';
import {
  isSensitivityAllowed,
  retrieveKnowledge,
} from '../../src/lib/knowledge/retrieval.ts';
import { UnauthorizedError } from '../../src/lib/editorial/validation.ts';

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

describe('knowledge retrieval', () => {
  let repository: EditorialRepository;

  beforeEach(async () => {
    const db = new DatabaseSync(':memory:');
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec(migrationSql);
    repository = new EditorialRepository(createSqliteD1(db));

    await ingestKnowledgeDocument(repository, {
      actorId: 'arturo@strtgy.ai',
      approvedSourceIds: new Set(['https://example.com/public-source']),
      allowManualUpload: true,
      document: {
        id: 'kd_public',
        title: 'Reporte público',
        sourceUrl: 'https://example.com/public-source',
        excerpt: 'Dato público sobre economía',
        sensitivity: 'public',
        license: 'CC-BY',
        collectedAt: '2026-08-01T00:00:00.000Z',
        publishedAt: '2026-07-30T00:00:00.000Z',
        approved: true,
      },
    });

    await ingestKnowledgeDocument(repository, {
      actorId: 'arturo@strtgy.ai',
      approvedSourceIds: new Set(),
      allowManualUpload: true,
      document: {
        id: 'kd_confidential',
        title: 'Memo interno',
        sourceUrl: 'https://intranet.example/memo',
        excerpt: 'Dato confidencial de investigación',
        sensitivity: 'confidential',
        license: 'internal',
        collectedAt: '2026-08-02T00:00:00.000Z',
        approved: true,
      },
    });
  });

  it('blocks non-approved sources without manual upload', () => {
    assert.throws(
      () =>
        assertIngestAllowed({
          actorId: 'a',
          approvedSourceIds: new Set(['https://allowed.example']),
          allowManualUpload: false,
          document: {
            id: 'x',
            title: 'x',
            sourceUrl: 'https://evil.example',
            excerpt: 'e',
            sensitivity: 'public',
            license: '',
            collectedAt: '2026-08-01T00:00:00.000Z',
            approved: true,
          },
        }),
      UnauthorizedError,
    );
  });

  it('returns complete citations and filters confidential for external models', async () => {
    const result = await retrieveKnowledge({
      repository,
      vectorize: null,
      query: {
        text: 'economía',
        actorSensitivity: 'internal',
        allowExternalModel: true,
      },
    });

    assert.equal(result.degraded, true);
    assert.equal(result.documents.length, 1);
    assert.equal(result.documents[0]?.id, 'kd_public');
    assert.equal(result.citations.length, 1);
    assert.equal(result.citations[0]?.sourceUrl, 'https://example.com/public-source');
    assert.ok(result.citations[0]?.excerpt);
    assert.ok(result.citations[0]?.verifiedAt);

    assert.equal(
      isSensitivityAllowed('confidential', 'internal', true),
      false,
    );
  });

  it('allows confidential when actor clearance is confidential and model is internal', async () => {
    const result = await retrieveKnowledge({
      repository,
      vectorize: {
        async query() {
          return { matches: [{ id: 'kd_confidential', score: 0.9 }] };
        },
      },
      query: {
        text: 'investigación',
        actorSensitivity: 'confidential',
        allowExternalModel: false,
      },
    });

    assert.ok(result.documents.some((doc) => doc.id === 'kd_confidential'));
    assert.equal(result.degraded, false);
  });
});
