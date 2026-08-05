import { ProviderError } from './resend.ts';

export type LinkedInPostPayload = {
  organizationUrn: string;
  commentary: string;
  canonicalUrl: string;
  title: string;
};

export type LinkedInDeliveryResult = {
  providerId: string;
  status: 'sent' | 'failed' | 'duplicate';
  diagnostic?: string;
};

export type LinkedInClient = {
  createOrganizationPost: (
    payload: LinkedInPostPayload,
  ) => Promise<{ id: string }>;
};

export function assertLinkedInPayload(payload: LinkedInPostPayload): void {
  if (!payload.organizationUrn.startsWith('urn:li:organization:')) {
    throw new ProviderError('organizationUrn inválido');
  }
  if (!payload.canonicalUrl.startsWith('https://')) {
    throw new ProviderError('canonicalUrl debe ser https');
  }
  if (!payload.commentary.trim() || !payload.title.trim()) {
    throw new ProviderError('commentary y title son obligatorios');
  }
}

export async function deliverLinkedInPost(input: {
  client: LinkedInClient;
  payload: LinkedInPostPayload;
  priorProviderId?: string | null;
}): Promise<LinkedInDeliveryResult> {
  assertLinkedInPayload(input.payload);

  if (input.priorProviderId) {
    return {
      providerId: input.priorProviderId,
      status: 'duplicate',
      diagnostic: 'Idempotent replay — prior delivery returned',
    };
  }

  try {
    const created = await input.client.createOrganizationPost(input.payload);
    return { providerId: created.id, status: 'sent' };
  } catch {
    return {
      providerId: '',
      status: 'failed',
      diagnostic: 'provider_failed',
    };
  }
}
