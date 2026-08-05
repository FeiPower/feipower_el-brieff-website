/**
 * Approved channel delivery executor shared by publish API and Workflow.
 */
import type { ContentItem, PublicationRequest } from '../editorial/contracts.ts';
import type { EditorialRepository } from '../editorial/repository.ts';
import { ConflictStateError } from '../editorial/validation.ts';
import { articleCanonicalUrl } from '../editorial/seo.ts';
import {
  UNSUBSCRIBE_PLACEHOLDER,
  deliverResendBroadcast,
  type ResendClient,
} from './resend.ts';
import { deliverLinkedInPost, type LinkedInClient } from './linkedin.ts';

export type DeliveryEnv = {
  RESEND_API_KEY?: string;
  RESEND_WEBHOOK_SECRET?: string;
  LINKEDIN_ACCESS_TOKEN?: string;
  LINKEDIN_ORGANIZATION_URN?: string;
};

export type ChannelDeliveryResult = {
  channel: 'resend' | 'linkedin';
  status: string;
  providerId: string | null;
  diagnostic?: string;
  workflowExecuted: boolean;
};

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function createSandboxResendClient(): ResendClient {
  return {
    async createBroadcast() {
      return { id: `resend_sandbox_${crypto.randomUUID()}` };
    },
    async sendBroadcast(id) {
      return { id };
    },
  };
}

function createSandboxLinkedInClient(): LinkedInClient {
  return {
    async createOrganizationPost() {
      return { id: `li_sandbox_${crypto.randomUUID()}` };
    },
  };
}

/**
 * Executes an approved PublicationRequest for resend|linkedin.
 * Idempotent via prior channel_deliveries provider IDs.
 */
export async function executeApprovedChannelDelivery(input: {
  repository: EditorialRepository;
  env: DeliveryEnv;
  publicationRequest: PublicationRequest;
  content: ContentItem;
  actorEmail: string;
  resendClient?: ResendClient;
  linkedInClient?: LinkedInClient;
  allowSandboxWithoutCredentials?: boolean;
}): Promise<ChannelDeliveryResult> {
  const {
    repository,
    env,
    publicationRequest,
    content,
    actorEmail,
    allowSandboxWithoutCredentials = true,
  } = input;

  const prior = await repository.getLatestDelivery(publicationRequest.id);
  const priorProviderId =
    prior && (prior.status === 'sent' || prior.status === 'duplicate')
      ? prior.providerId
      : null;

  if (publicationRequest.approvalState === 'executed' && prior) {
    return {
      channel:
        publicationRequest.channel === 'resend' ? 'resend' : 'linkedin',
      status: prior.status === 'failed' ? 'failed' : 'duplicate',
      providerId: prior.providerId,
      diagnostic: 'Idempotent workflow replay — prior delivery returned',
      workflowExecuted: true,
    };
  }

  if (publicationRequest.approvalState !== 'approved') {
    throw new ConflictStateError(
      'Solo se ejecutan PublicationRequest en estado approved',
    );
  }

  if (publicationRequest.channel === 'resend') {
    if (!env.RESEND_API_KEY && !allowSandboxWithoutCredentials) {
      throw new ConflictStateError('RESEND_API_KEY ausente (sandbox)');
    }
    const client = input.resendClient ?? createSandboxResendClient();
    const result = await deliverResendBroadcast({
      priorProviderId,
      client,
      payload: {
        subject: content.title,
        html: `<p>${content.summary}</p><p><a href="${content.canonicalUrl ?? ''}">Leer</a></p><p><a href="${UNSUBSCRIBE_PLACEHOLDER}">Cancelar suscripción</a></p>`,
        text: `${content.summary}\n${content.canonicalUrl ?? ''}\n${UNSUBSCRIBE_PLACEHOLDER}`,
        segmentId: 'sandbox',
        testRecipient: actorEmail,
      },
    });
    await repository.recordChannelDelivery({
      id: newId('del'),
      publicationRequestId: publicationRequest.id,
      channel: 'resend',
      providerId: result.providerId || null,
      status: result.status,
      diagnostic: result.diagnostic ?? null,
      actorId: actorEmail,
    });
    await repository.updatePublicationApproval(
      publicationRequest.id,
      result.status === 'failed' ? 'failed' : 'executed',
      actorEmail,
    );
    return {
      channel: 'resend',
      status: result.status,
      providerId: result.providerId || null,
      diagnostic: result.diagnostic,
      workflowExecuted: true,
    };
  }

  if (publicationRequest.channel === 'linkedin') {
    const org = env.LINKEDIN_ORGANIZATION_URN;
    if (
      (!org || !env.LINKEDIN_ACCESS_TOKEN) &&
      !allowSandboxWithoutCredentials
    ) {
      throw new ConflictStateError('Credenciales LinkedIn sandbox ausentes');
    }
    const organizationUrn =
      org && org.startsWith('urn:li:organization:')
        ? org
        : 'urn:li:organization:sandbox';
    const client = input.linkedInClient ?? createSandboxLinkedInClient();
    const result = await deliverLinkedInPost({
      priorProviderId,
      client,
      payload: {
        organizationUrn,
        commentary: content.summary,
        canonicalUrl: content.canonicalUrl ?? articleCanonicalUrl(content.slug),
        title: content.title,
      },
    });
    await repository.recordChannelDelivery({
      id: newId('del'),
      publicationRequestId: publicationRequest.id,
      channel: 'linkedin',
      providerId: result.providerId || null,
      status: result.status,
      diagnostic: result.diagnostic ?? null,
      actorId: actorEmail,
    });
    await repository.updatePublicationApproval(
      publicationRequest.id,
      result.status === 'failed' ? 'failed' : 'executed',
      actorEmail,
    );
    return {
      channel: 'linkedin',
      status: result.status,
      providerId: result.providerId || null,
      diagnostic: result.diagnostic,
      workflowExecuted: true,
    };
  }

  throw new ConflictStateError('Canal no ejecutable en este workflow');
}
