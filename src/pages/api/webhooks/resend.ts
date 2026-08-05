import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { EditorialRepository } from '../../../lib/editorial/repository.ts';
import { verifyResendWebhookSignature } from '../../../lib/integrations/resend.ts';

export const prerender = false;

type ResendWebhookPayload = {
  type?: unknown;
  data?: {
    broadcast_id?: unknown;
    email_id?: unknown;
  };
};

export const POST: APIRoute = async ({ request }) => {
  if (!env.RESEND_WEBHOOK_SECRET) {
    return new Response('Webhook no configurado', { status: 503 });
  }

  const rawBody = await request.text();
  const isValid = await verifyResendWebhookSignature({
    rawBody,
    svixId: request.headers.get('svix-id'),
    svixTimestamp: request.headers.get('svix-timestamp'),
    svixSignature: request.headers.get('svix-signature'),
    secret: env.RESEND_WEBHOOK_SECRET,
  });
  if (!isValid) {
    return new Response('Firma inválida', { status: 401 });
  }

  let payload: ResendWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as ResendWebhookPayload;
  } catch {
    return new Response('Payload inválido', { status: 400 });
  }

  const eventType = typeof payload.type === 'string' ? payload.type : 'unknown';
  const deliveryId =
    typeof payload.data?.broadcast_id === 'string'
      ? payload.data.broadcast_id
      : typeof payload.data?.email_id === 'string'
        ? payload.data.email_id
        : request.headers.get('svix-id') ?? 'unknown';

  await new EditorialRepository(env.EDITORIAL_DB).recordAuditEvent({
    entityType: 'resend_webhook',
    entityId: deliveryId,
    action: eventType,
    actorId: 'resend',
    payload: {
      svixId: request.headers.get('svix-id'),
      eventType,
    },
  });

  return new Response(null, { status: 204 });
};
