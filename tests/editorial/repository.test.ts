import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { describe, it, beforeEach } from 'node:test';
import {
  ConflictError,
  EditorialRepository,
  NotFoundError,
} from '../../src/lib/editorial/repository.ts';

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

describe('EditorialRepository', () => {
  let repository: EditorialRepository;

  beforeEach(() => {
    const db = new DatabaseSync(':memory:');
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec(migrationSql);
    repository = new EditorialRepository(createSqliteD1(db));
  });

  it('creates content, versions, and audit events with bound parameters', async () => {
    await repository.ensureAuthor({
      id: 'author_arturo',
      name: 'Arturo Salazar Bazúa',
      handle: '@elchearturo',
    });

    const created = await repository.createContentItem(
      {
        id: 'content_1',
        kind: 'column',
        status: 'draft',
        slug: 'primera-columna',
        title: 'Primera columna',
        summary: 'Resumen',
        bodyMarkdown: 'Cuerpo',
        authorId: 'author_arturo',
      },
      'actor_arturo',
    );

    assert.equal(created.slug, 'primera-columna');
    assert.equal(created.status, 'draft');

    const audits = await repository.listAuditEvents('content_item', 'content_1');
    assert.equal(audits.length, 1);
    assert.equal(audits[0]?.action, 'create');
  });

  it('rejects duplicate slug with ConflictError', async () => {
    await repository.ensureAuthor({
      id: 'author_arturo',
      name: 'Arturo Salazar Bazúa',
    });

    await repository.createContentItem(
      {
        id: 'content_1',
        kind: 'column',
        status: 'draft',
        slug: 'mismo-slug',
        title: 'Uno',
        summary: '',
        bodyMarkdown: '',
        authorId: 'author_arturo',
      },
      'actor_arturo',
    );

    await assert.rejects(
      () =>
        repository.createContentItem(
          {
            id: 'content_2',
            kind: 'column',
            status: 'draft',
            slug: 'mismo-slug',
            title: 'Dos',
            summary: '',
            bodyMarkdown: '',
            authorId: 'author_arturo',
          },
          'actor_arturo',
        ),
      (error: unknown) => error instanceof ConflictError,
    );
  });

  it('enforces unique idempotency keys for publication requests', async () => {
    await repository.ensureAuthor({
      id: 'author_arturo',
      name: 'Arturo Salazar Bazúa',
    });
    await repository.createContentItem(
      {
        id: 'content_1',
        kind: 'column',
        status: 'approved',
        slug: 'aprobada',
        title: 'Aprobada',
        summary: 'S',
        bodyMarkdown: 'B',
        authorId: 'author_arturo',
      },
      'actor_arturo',
    );

    await repository.createPublicationRequest(
      {
        id: 'pub_1',
        contentItemId: 'content_1',
        channel: 'linkedin',
        payloadVersion: 1,
        approvalState: 'approved',
        idempotencyKey: 'idem-1',
      },
      'actor_arturo',
    );

    await assert.rejects(
      () =>
        repository.createPublicationRequest(
          {
            id: 'pub_2',
            contentItemId: 'content_1',
            channel: 'resend',
            payloadVersion: 1,
            approvalState: 'approved',
            idempotencyKey: 'idem-1',
          },
          'actor_arturo',
        ),
      (error: unknown) => error instanceof ConflictError,
    );
  });

  it('throws NotFoundError for missing content ids', async () => {
    await assert.rejects(
      () => repository.getContentItemById('missing'),
      (error: unknown) => error instanceof NotFoundError,
    );
  });

  it('updates content and writes a second audit event', async () => {
    await repository.ensureAuthor({
      id: 'author_arturo',
      name: 'Arturo Salazar Bazúa',
    });
    await repository.createContentItem(
      {
        id: 'content_1',
        kind: 'column',
        status: 'draft',
        slug: 'editar',
        title: 'Antes',
        summary: 'S',
        bodyMarkdown: 'B',
        authorId: 'author_arturo',
      },
      'actor_arturo',
    );

    const updated = await repository.updateContentItem(
      'content_1',
      { title: 'Después', status: 'editing' },
      'actor_arturo',
    );

    assert.equal(updated.title, 'Después');
    assert.equal(updated.status, 'editing');

    const audits = await repository.listAuditEvents('content_item', 'content_1');
    assert.equal(audits.length, 2);
    assert.ok(audits.some((event) => event.action === 'update'));
    assert.ok(audits.some((event) => event.action === 'create'));
  });
});
