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
  assertPublishPrerequisites,
  canCreatePublicationRequest,
  ConflictStateError,
  resolveAccessIdentity,
} from '../../../lib/editorial/validation.ts';
import {
  parseEditorialStatus,
  type ContentItem,
  type EditorialStatus,
  type PublicationRequest,
} from '../../../lib/editorial/contracts.ts';
import { executeApprovedChannelDelivery } from '../../../lib/integrations/delivery.ts';
import { articleCanonicalUrl } from '../../../lib/editorial/seo.ts';

export const prerender = false;

type ApiSuccess = {
  ok: true;
  content: ContentItem;
  publicationRequest?: PublicationRequest;
  delivery?: {
    channel: string;
    status: string;
    providerId: string | null;
  };
  workflowId?: string;
};
type ApiFailure = {
  ok: false;
  error: 'validation' | 'unauthorized' | 'not_found' | 'conflict';
  message?: string;
};

function json(body: ApiSuccess | ApiFailure, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
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
    contentItemId?: unknown;
    to?: unknown;
    channel?: unknown;
    idempotencyKey?: unknown;
    category?: unknown;
    disclosure?: unknown;
    featuredAssetId?: unknown;
    featuredAssetKey?: unknown;
    executeApprovedDelivery?: unknown;
    publicationRequestId?: unknown;
    approvePublicationRequest?: unknown;
  };

  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ ok: false, error: 'validation', message: 'JSON inválido' }, 422);
  }

  if (
    typeof payload.contentItemId !== 'string' ||
    typeof payload.to !== 'string'
  ) {
    return json(
      {
        ok: false,
        error: 'validation',
        message: 'contentItemId y to son requeridos',
      },
      422,
    );
  }

  let toStatus: EditorialStatus;
  try {
    toStatus = parseEditorialStatus(payload.to);
  } catch {
    return json(
      { ok: false, error: 'validation', message: 'Estado destino inválido' },
      422,
    );
  }

  const repository = new EditorialRepository(env.EDITORIAL_DB);
  const actorId = identity.email;

  try {
    const current = await repository.getContentItemById(payload.contentItemId);
    assertEditorialTransition(current.status, toStatus);

    if (typeof payload.featuredAssetId === 'string') {
      const assetKey =
        typeof payload.featuredAssetKey === 'string'
          ? payload.featuredAssetKey
          : `assets/${payload.featuredAssetId}`;
      await repository.ensureAsset({
        id: payload.featuredAssetId,
        contentItemId: current.id,
        r2Key: assetKey,
        contentType: 'image/png',
        altText: current.title,
      });
    }

    if (
      typeof payload.category === 'string' ||
      typeof payload.disclosure === 'string' ||
      typeof payload.featuredAssetId === 'string'
    ) {
      const existing = await repository.getPublishMetadata(current.id);
      await repository.setPublishMetadata(
        current.id,
        {
          category:
            typeof payload.category === 'string'
              ? payload.category
              : (existing.category ?? ''),
          disclosure:
            typeof payload.disclosure === 'string'
              ? payload.disclosure
              : (existing.disclosure ?? ''),
          featuredAssetId:
            typeof payload.featuredAssetId === 'string'
              ? payload.featuredAssetId
              : (existing.featuredAssetId ?? ''),
        },
        actorId,
      );
    }

    const metadata = await repository.getPublishMetadata(current.id);
    const citations = await repository.listCitations(current.id);

    if (toStatus === 'scheduled' || toStatus === 'published') {
      assertPublishPrerequisites(current, {
        category: metadata.category,
        disclosure: metadata.disclosure,
        featuredAssetId: metadata.featuredAssetId,
        citations,
      });
    }

    const publishedAt =
      toStatus === 'published' || toStatus === 'scheduled'
        ? (current.publishedAt ?? new Date().toISOString())
        : current.publishedAt;

    const content = await repository.updateContentItem(
      current.id,
      {
        status: toStatus,
        publishedAt,
        canonicalUrl:
          current.canonicalUrl ?? articleCanonicalUrl(current.slug),
      },
      actorId,
    );

    let publicationRequest: PublicationRequest | undefined;
    if (canCreatePublicationRequest(current.status, toStatus)) {
      const channel =
        payload.channel === 'resend' ||
        payload.channel === 'rss' ||
        payload.channel === 'partner'
          ? payload.channel
          : 'linkedin';
      const idempotencyKey =
        typeof payload.idempotencyKey === 'string' &&
        payload.idempotencyKey.length > 0
          ? payload.idempotencyKey
          : `${content.id}:${channel}:${toStatus}`;

      const existing =
        await repository.getPublicationRequestByIdempotencyKey(idempotencyKey);
      if (existing) {
        publicationRequest = existing;
      } else {
        publicationRequest = await repository.createPublicationRequest(
          {
            id: newId('pub'),
            contentItemId: content.id,
            channel,
            payloadVersion: 1,
            approvalState: 'needs_approval',
            idempotencyKey,
            scheduledAt: toStatus === 'scheduled' ? publishedAt : null,
          },
          actorId,
        );
      }
    }

    let delivery:
      | { channel: string; status: string; providerId: string | null }
      | undefined;
    let workflowId: string | undefined;

    if (
      payload.executeApprovedDelivery === true &&
      typeof payload.publicationRequestId === 'string'
    ) {
      let requestRow = await repository.getPublicationRequestById(
        payload.publicationRequestId,
      );

      if (
        payload.approvePublicationRequest === true &&
        requestRow.approvalState === 'needs_approval'
      ) {
        requestRow = await repository.updatePublicationApproval(
          requestRow.id,
          'approved',
          actorId,
        );
      }

      if (requestRow.approvalState !== 'approved') {
        throw new ConflictStateError(
          'Solo se ejecutan PublicationRequest en estado approved',
        );
      }

      try {
        const instance = await env.EDITORIAL_WORKFLOW.create({
          id: `wf_${requestRow.idempotencyKey}`,
          params: {
            publicationRequestId: requestRow.id,
            channel: requestRow.channel,
            approvalState: 'approved',
            actorEmail: actorId,
            promptVersion: 'editorial-v1',
            model: '@cf/meta/llama-3.1-8b-instruct',
            contentItemId: content.id,
          },
        });
        workflowId = instance.id;
      } catch {
        await repository.recordAuditEvent({
          entityType: 'publication_request',
          entityId: requestRow.id,
          action: 'workflow_create_failed_inline_fallback',
          actorId,
          payload: { channel: requestRow.channel },
        });
      }

      const result = await executeApprovedChannelDelivery({
        repository,
        env,
        publicationRequest: requestRow,
        content,
        actorEmail: actorId,
        allowSandboxWithoutCredentials: true,
      });
      delivery = {
        channel: result.channel,
        status: result.status,
        providerId: result.providerId,
      };
    }

    return json(
      { ok: true, content, publicationRequest, delivery, workflowId },
      200,
    );
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
      { ok: false, error: 'validation', message: 'No se pudo publicar' },
      422,
    );
  }
};
