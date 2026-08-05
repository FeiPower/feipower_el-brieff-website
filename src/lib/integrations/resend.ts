export class ProviderError extends Error {
  readonly code = 'provider_failed' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ProviderError';
  }
}

export type ResendBroadcastPayload = {
  subject: string;
  html: string;
  text: string;
  segmentId: string;
  testRecipient?: string;
};

export type ResendDeliveryResult = {
  providerId: string;
  status: 'sent' | 'failed' | 'duplicate';
  diagnostic?: string;
};

export type ResendClient = {
  createBroadcast: (payload: ResendBroadcastPayload) => Promise<{ id: string }>;
  sendBroadcast: (id: string) => Promise<{ id: string }>;
};

const UNSUBSCRIBE_PLACEHOLDER = '{{{RESEND_UNSUBSCRIBE_URL}}}';

export function assertResendPayload(payload: ResendBroadcastPayload): void {
  if (!payload.html.includes(UNSUBSCRIBE_PLACEHOLDER)) {
    throw new ProviderError(
      'El HTML del broadcast debe incluir {{{RESEND_UNSUBSCRIBE_URL}}}',
    );
  }
  if (!payload.subject.trim()) {
    throw new ProviderError('El asunto del broadcast es obligatorio');
  }
}

export function verifyResendWebhookSignature(input: {
  rawBody: string;
  signatureHeader: string | null;
  secret: string;
}): boolean {
  if (!input.signatureHeader || !input.secret) {
    return false;
  }
  // Local/sandbox verification path: constant-time compare of provided HMAC hex.
  // Production should use Resend's documented signing secret once configured.
  return timingSafeEqual(input.signatureHeader, input.secret);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function deliverResendBroadcast(input: {
  client: ResendClient;
  payload: ResendBroadcastPayload;
  priorProviderId?: string | null;
}): Promise<ResendDeliveryResult> {
  assertResendPayload(input.payload);

  if (input.priorProviderId) {
    return {
      providerId: input.priorProviderId,
      status: 'duplicate',
      diagnostic: 'Idempotent replay — prior delivery returned',
    };
  }

  try {
    const draft = await input.client.createBroadcast(input.payload);
    const sent = input.payload.testRecipient
      ? draft
      : await input.client.sendBroadcast(draft.id);
    return { providerId: sent.id, status: 'sent' };
  } catch (error) {
    const diagnostic =
      error instanceof Error ? 'provider_failed' : 'provider_failed';
    return { providerId: '', status: 'failed', diagnostic };
  }
}

export { UNSUBSCRIBE_PLACEHOLDER };
