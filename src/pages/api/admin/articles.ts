import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import {
  ConflictError,
  EditorialRepository,
  NotFoundError,
} from '../../../lib/editorial/repository.ts';
import {
  UnauthorizedError,
  assertEditorialTransition,
  ConflictStateError,
  resolveAccessIdentity,
  validateDraftArticleForm,
} from '../../../lib/editorial/validation.ts';
import {
  parseEditorialStatus,
  type ContentItem,
  type EditorialStatus,
} from '../../../lib/editorial/contracts.ts';

export const prerender = false;

type ApiSuccess = { ok: true; content: ContentItem };
type ApiFailure = {
  ok: false;
  error: 'validation' | 'unauthorized' | 'not_found' | 'conflict';
  message?: string;
  fields?: Record<string, string>;
};

function json(body: ApiSuccess | ApiFailure, status: number): Response {
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

  const contentType = request.headers.get('content-type') ?? '';
  let form: FormData;
  try {
    if (contentType.includes('application/json')) {
      const payload = (await request.json()) as Record<string, unknown>;
      form = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (typeof value === 'string' || typeof value === 'number') {
          form.set(key, String(value));
        }
      }
    } else {
      form = await request.formData();
    }
  } catch {
    return json({ ok: false, error: 'validation', message: 'JSON inválido' }, 422);
  }

  const validated = validateDraftArticleForm(form);
  if (!validated.ok) {
    return json(
      { ok: false, error: 'validation', fields: validated.errors },
      422,
    );
  }

  const repository = new EditorialRepository(env.EDITORIAL_DB);

  try {
    const content = await repository.persistValidatedDraft(
      identity.email,
      validated.value,
    );
    return json({ ok: true, content }, 201);
  } catch (error) {
    if (error instanceof ConflictError) {
      return json(
        { ok: false, error: 'conflict', message: error.message },
        409,
      );
    }
    return json(
      { ok: false, error: 'validation', message: 'No se pudo crear el artículo' },
      422,
    );
  }
};

export const PATCH: APIRoute = async ({ request }) => {
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
    id?: unknown;
    to?: unknown;
    title?: unknown;
    summary?: unknown;
    bodyMarkdown?: unknown;
  };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ ok: false, error: 'validation', message: 'JSON inválido' }, 422);
  }

  if (typeof payload.id !== 'string' || payload.id.length === 0) {
    return json(
      { ok: false, error: 'validation', message: 'id requerido' },
      422,
    );
  }

  const repository = new EditorialRepository(env.EDITORIAL_DB);
  const actorId = identity.email;

  try {
    const current = await repository.getContentItemById(payload.id);
    let nextStatus: EditorialStatus | undefined;
    if (typeof payload.to === 'string') {
      nextStatus = parseEditorialStatus(payload.to);
      assertEditorialTransition(current.status, nextStatus);
    }

    const content = await repository.updateContentItem(
      payload.id,
      {
        status: nextStatus,
        title: typeof payload.title === 'string' ? payload.title : undefined,
        summary:
          typeof payload.summary === 'string' ? payload.summary : undefined,
        bodyMarkdown:
          typeof payload.bodyMarkdown === 'string'
            ? payload.bodyMarkdown
            : undefined,
      },
      actorId,
    );

    return json({ ok: true, content }, 200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return json(
        { ok: false, error: 'not_found', message: error.message },
        404,
      );
    }
    if (error instanceof ConflictStateError || error instanceof ConflictError) {
      return json(
        { ok: false, error: 'conflict', message: error.message },
        409,
      );
    }
    return json(
      { ok: false, error: 'validation', message: 'No se pudo actualizar' },
      422,
    );
  }
};
