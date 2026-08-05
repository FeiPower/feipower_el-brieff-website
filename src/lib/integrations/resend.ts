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

function decodeBase64(value: string): Uint8Array {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function hasSameBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index]! ^ right[index]!;
  }
  return mismatch === 0;
}

/**
 * Verifies Resend's Svix signature over `${svix-id}.${svix-timestamp}.${rawBody}`.
 * The webhook payload must be read as text before JSON parsing.
 */
export async function verifyResendWebhookSignature(input: {
  rawBody: string;
  svixId: string | null;
  svixTimestamp: string | null;
  svixSignature: string | null;
  secret: string;
  now?: Date;
}): Promise<boolean> {
  if (
    !input.svixId ||
    !input.svixTimestamp ||
    !input.svixSignature ||
    !input.secret.startsWith('whsec_')
  ) {
    return false;
  }

  const timestampSeconds = Number(input.svixTimestamp);
  if (!Number.isSafeInteger(timestampSeconds)) {
    return false;
  }

  const nowSeconds = Math.floor((input.now ?? new Date()).getTime() / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > 300) {
    return false;
  }

  let keyBytes: Uint8Array;
  try {
    keyBytes = decodeBase64(input.secret.slice('whsec_'.length));
  } catch {
    return false;
  }

  const encoder = new TextEncoder();
  const signingContent = `${input.svixId}.${input.svixTimestamp}.${input.rawBody}`;
  const keyMaterial = new Uint8Array(keyBytes).buffer;
  const key = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, encoder.encode(signingContent)),
  );

  return input.svixSignature
    .split(' ')
    .map((entry) => entry.trim().split(',', 2))
    .some(([version, encodedSignature]) => {
      if (version !== 'v1' || !encodedSignature) {
        return false;
      }
      try {
        return hasSameBytes(signature, decodeBase64(encodedSignature));
      } catch {
        return false;
      }
    });
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
