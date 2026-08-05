import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getAgentByName } from 'agents';
import {
  UnauthorizedError,
  resolveAccessIdentity,
} from '../../../lib/editorial/validation.ts';
import type { SideEffectTool } from '../../../lib/agents/workflows.ts';
import type { RetrievalResult } from '../../../lib/knowledge/retrieval.ts';

export const prerender = false;

type AgentStub = {
  runBrief: (input: {
    brief: string;
    actorEmail: string;
    retrieval?: RetrievalResult;
    sessionId?: string;
  }) => Promise<unknown>;
  requestTool: (input: {
    actorEmail: string;
    tool: SideEffectTool;
  }) => Promise<unknown>;
  approveTool: (input: {
    actorEmail: string;
    tool: SideEffectTool;
  }) => Promise<unknown>;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let identity;
  try {
    identity = resolveAccessIdentity(request, {
      ACCESS_ALLOWED_EMAILS: env.ACCESS_ALLOWED_EMAILS,
      EDITORIAL_DEV_ACTOR_EMAIL: env.EDITORIAL_DEV_ACTOR_EMAIL,
    });
  } catch (error) {
    const message =
      error instanceof UnauthorizedError ? error.message : 'unauthorized';
    return json({ ok: false, error: 'unauthorized', message }, 401);
  }

  let payload: {
    action?: unknown;
    sessionId?: unknown;
    brief?: unknown;
    tool?: unknown;
    retrieval?: unknown;
  };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ ok: false, error: 'validation', message: 'JSON inválido' }, 422);
  }

  const sessionId =
    typeof payload.sessionId === 'string' && payload.sessionId.length > 0
      ? payload.sessionId
      : `arturo-${identity.email}`;

  const stub = (await getAgentByName(
    env.EDITORIAL_AGENT,
    sessionId,
  )) as unknown as AgentStub;

  try {
    if (payload.action === 'requestTool') {
      if (
        payload.tool !== 'publish' &&
        payload.tool !== 'send_newsletter' &&
        payload.tool !== 'knowledge_ingest' &&
        payload.tool !== 'config_change'
      ) {
        return json(
          { ok: false, error: 'validation', message: 'tool inválido' },
          422,
        );
      }
      const result = await stub.requestTool({
        actorEmail: identity.email,
        tool: payload.tool,
      });
      return json(result, 200);
    }

    if (payload.action === 'approveTool') {
      if (
        payload.tool !== 'publish' &&
        payload.tool !== 'send_newsletter' &&
        payload.tool !== 'knowledge_ingest' &&
        payload.tool !== 'config_change'
      ) {
        return json(
          { ok: false, error: 'validation', message: 'tool inválido' },
          422,
        );
      }
      const result = await stub.approveTool({
        actorEmail: identity.email,
        tool: payload.tool,
      });
      return json(result, 200);
    }

    if (typeof payload.brief !== 'string' || payload.brief.length < 3) {
      return json(
        { ok: false, error: 'validation', message: 'brief requerido' },
        422,
      );
    }

    const result = await stub.runBrief({
      brief: payload.brief,
      actorEmail: identity.email,
      sessionId,
      retrieval:
        payload.retrieval && typeof payload.retrieval === 'object'
          ? (payload.retrieval as RetrievalResult)
          : undefined,
    });
    return json(result, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'agent_failed';
    return json({ ok: false, error: 'conflict', message }, 409);
  }
};
