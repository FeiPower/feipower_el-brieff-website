import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  ApprovalRequiredError,
  advanceAgentWorkflow,
  assertWorkflowMayExecute,
  createInitialAgentState,
  executeApprovedSideEffect,
  persistAgentAuditEntries,
  requestSideEffectTool,
} from '../../src/lib/agents/workflows.ts';
import { EditorialRepository } from '../../src/lib/editorial/repository.ts';
import type { RetrievalResult } from '../../src/lib/knowledge/retrieval.ts';

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

describe('editorial agent approvals', () => {
  it('runs non-side-effect draft workflow with citations', () => {
    let state = createInitialAgentState({
      brief: 'Analizar el nearshoring en México',
      actorEmail: 'arturo@strtgy.ai',
      model: '@cf/meta/llama-3.1-8b-instruct',
      promptVersion: 'editorial-v1',
    });

    const retrieval: RetrievalResult = {
      degraded: false,
      documents: [],
      citations: [
        {
          id: 'cite1',
          contentItemId: 'research',
          sourceId: 's1',
          claim: 'La IED creció',
          excerpt: 'Extracto',
          sourceUrl: 'https://example.com/ied',
          publishedAt: '2026-07-01T00:00:00.000Z',
          verifiedAt: '2026-08-01T00:00:00.000Z',
        },
      ],
    };

    state = advanceAgentWorkflow(state);
    state = advanceAgentWorkflow(state);
    state = advanceAgentWorkflow(state, retrieval);
    state = advanceAgentWorkflow(state);
    state = advanceAgentWorkflow(state);

    assert.equal(state.step, 'citation_tone_check');
    assert.match(state.draftMarkdown, /nearshoring/i);
    assert.equal(state.citations.length, 1);
    assert.ok(
      state.audit.some(
        (entry) =>
          entry.promptVersion === 'editorial-v1' &&
          entry.model === '@cf/meta/llama-3.1-8b-instruct',
      ),
    );
  });

  it('blocks send tools without approval and records needs_approval', () => {
    const state = createInitialAgentState({
      brief: 'Newsletter semanal',
      actorEmail: 'arturo@strtgy.ai',
    });

    const pending = requestSideEffectTool({
      state,
      tool: 'send_newsletter',
      actorEmail: 'arturo@strtgy.ai',
    });

    assert.equal(pending.approvalState, 'needs_approval');
    assert.throws(
      () => assertWorkflowMayExecute(pending.approvalState),
      ApprovalRequiredError,
    );
    assert.throws(
      () =>
        executeApprovedSideEffect({
          state: pending,
          tool: 'send_newsletter',
        }),
      ApprovalRequiredError,
    );
    assert.ok(
      pending.audit.some((entry) => entry.action === 'tool_needs_approval'),
    );
  });

  it('persists prompt/model/citations/approvals to D1 audit_events', async () => {
    const db = new DatabaseSync(':memory:');
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec(migrationSql);
    const repository = new EditorialRepository(createSqliteD1(db));

    let state = createInitialAgentState({
      brief: 'Auditar nearshoring',
      actorEmail: 'arturo@strtgy.ai',
      sessionId: 'agent_session_test',
      model: '@cf/meta/llama-3.1-8b-instruct',
      promptVersion: 'editorial-v1',
    });
    state = requestSideEffectTool({
      state,
      tool: 'send_newsletter',
      actorEmail: 'arturo@strtgy.ai',
    });

    const written = await persistAgentAuditEntries({ repository, state });
    assert.ok(written >= 2);

    const events = await repository.listAuditEvents(
      'agent_session',
      'agent_session_test',
    );
    assert.ok(events.length >= 2);
    assert.ok(
      events.some((event) => {
        const payload = JSON.parse(event.payloadJson) as {
          promptVersion?: string;
          model?: string;
          action?: string;
        };
        return (
          event.action === 'tool_needs_approval' &&
          payload.promptVersion === 'editorial-v1' &&
          payload.model === '@cf/meta/llama-3.1-8b-instruct'
        );
      }),
    );
  });
});
