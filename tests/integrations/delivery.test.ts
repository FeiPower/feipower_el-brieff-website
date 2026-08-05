import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { describe, it, beforeEach } from 'node:test';
import { EditorialRepository } from '../../src/lib/editorial/repository.ts';
import { executeApprovedChannelDelivery } from '../../src/lib/integrations/delivery.ts';
import { ConflictStateError } from '../../src/lib/editorial/validation.ts';

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

describe('approved channel delivery', () => {
  let repository: EditorialRepository;

  beforeEach(() => {
    const db = new DatabaseSync(':memory:');
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec(migrationSql);
    repository = new EditorialRepository(createSqliteD1(db));
  });

  it('executes approved linkedin delivery and is idempotent on replay', async () => {
    await repository.ensureAuthor({ id: 'a1', name: 'Arturo' });
    const content = await repository.createContentItem(
      {
        id: 'c1',
        kind: 'column',
        status: 'published',
        slug: 'demo-delivery',
        title: 'Demo',
        summary: 'Resumen de entrega',
        bodyMarkdown: 'Cuerpo con suficiente texto',
        authorId: 'a1',
        publishedAt: '2026-08-04T12:00:00.000Z',
        canonicalUrl: 'https://el-brieff.strtgy.ai/opinion/demo-delivery/',
      },
      'a1',
    );
    const publicationRequest = await repository.createPublicationRequest(
      {
        id: 'pub1',
        contentItemId: content.id,
        channel: 'linkedin',
        payloadVersion: 1,
        approvalState: 'approved',
        idempotencyKey: 'c1:linkedin:published',
      },
      'a1',
    );

    let posts = 0;
    const first = await executeApprovedChannelDelivery({
      repository,
      env: {
        LINKEDIN_ORGANIZATION_URN: 'urn:li:organization:123',
        LINKEDIN_ACCESS_TOKEN: 'sandbox',
      },
      publicationRequest,
      content,
      actorEmail: 'arturo@strtgy.ai',
      linkedInClient: {
        async createOrganizationPost() {
          posts += 1;
          return { id: 'li_1' };
        },
      },
    });

    assert.equal(first.status, 'sent');
    assert.equal(first.providerId, 'li_1');
    assert.equal(posts, 1);

    const executed = await repository.getPublicationRequestById('pub1');
    const second = await executeApprovedChannelDelivery({
      repository,
      env: {},
      publicationRequest: executed,
      content,
      actorEmail: 'arturo@strtgy.ai',
      linkedInClient: {
        async createOrganizationPost() {
          posts += 1;
          return { id: 'li_2' };
        },
      },
    });

    assert.equal(second.status, 'duplicate');
    assert.equal(second.providerId, 'li_1');
    assert.equal(posts, 1);
  });

  it('rejects delivery without approved state', async () => {
    await repository.ensureAuthor({ id: 'a1', name: 'Arturo' });
    const content = await repository.createContentItem(
      {
        id: 'c2',
        kind: 'column',
        status: 'published',
        slug: 'blocked',
        title: 'Blocked',
        summary: 'Resumen suficiente',
        bodyMarkdown: 'Cuerpo suficiente para prueba',
        authorId: 'a1',
      },
      'a1',
    );
    const publicationRequest = await repository.createPublicationRequest(
      {
        id: 'pub2',
        contentItemId: content.id,
        channel: 'resend',
        payloadVersion: 1,
        approvalState: 'needs_approval',
        idempotencyKey: 'c2:resend',
      },
      'a1',
    );

    await assert.rejects(
      () =>
        executeApprovedChannelDelivery({
          repository,
          env: { RESEND_API_KEY: 'x' },
          publicationRequest,
          content,
          actorEmail: 'arturo@strtgy.ai',
        }),
      ConflictStateError,
    );
  });
});
