/**
 * Shared editorial contracts for El Brieff CMS.
 * Unknown enum values must throw ValidationError — never coerce.
 */

export type ContentKind = 'episode' | 'column' | 'newsletter';

export type EditorialStatus =
  | 'idea'
  | 'research'
  | 'draft'
  | 'editing'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'syndicated';

export type Sensitivity = 'public' | 'internal' | 'confidential';

export type ApprovalState =
  | 'draft'
  | 'needs_approval'
  | 'approved'
  | 'rejected'
  | 'executed'
  | 'failed';

export type PublicationChannel = 'linkedin' | 'resend' | 'rss' | 'partner';

export type AgentToolError =
  | 'validation'
  | 'unauthorized'
  | 'not_found'
  | 'conflict'
  | 'provider_failed';

export interface ContentItem {
  id: string;
  kind: ContentKind;
  status: EditorialStatus;
  slug: string;
  title: string;
  summary: string;
  bodyMarkdown: string;
  authorId: string;
  publishedAt: string | null;
  updatedAt: string;
  canonicalUrl: string | null;
}

export interface Citation {
  id: string;
  contentItemId: string;
  sourceId: string;
  claim: string;
  excerpt: string;
  sourceUrl: string;
  publishedAt: string | null;
  verifiedAt: string;
}

export interface PublicationRequest {
  id: string;
  contentItemId: string;
  channel: PublicationChannel;
  payloadVersion: number;
  approvalState: ApprovalState;
  idempotencyKey: string;
  scheduledAt: string | null;
}

export interface AgentToolResult<T> {
  ok: boolean;
  data?: T;
  error?: AgentToolError;
  citations: Citation[];
}

export class ValidationError extends Error {
  readonly code = 'validation' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const CONTENT_KINDS: ReadonlySet<string> = new Set([
  'episode',
  'column',
  'newsletter',
]);

const EDITORIAL_STATUSES: ReadonlySet<string> = new Set([
  'idea',
  'research',
  'draft',
  'editing',
  'approved',
  'scheduled',
  'published',
  'syndicated',
]);

const SENSITIVITIES: ReadonlySet<string> = new Set([
  'public',
  'internal',
  'confidential',
]);

const APPROVAL_STATES: ReadonlySet<string> = new Set([
  'draft',
  'needs_approval',
  'approved',
  'rejected',
  'executed',
  'failed',
]);

const PUBLICATION_CHANNELS: ReadonlySet<string> = new Set([
  'linkedin',
  'resend',
  'rss',
  'partner',
]);

function requireNonEmptyId(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`Invalid identifier for ${field}`);
  }
  return value;
}

export function parseContentKind(value: unknown): ContentKind {
  if (typeof value !== 'string' || !CONTENT_KINDS.has(value)) {
    throw new ValidationError('Invalid ContentKind');
  }
  return value as ContentKind;
}

export function parseEditorialStatus(value: unknown): EditorialStatus {
  if (typeof value !== 'string' || !EDITORIAL_STATUSES.has(value)) {
    throw new ValidationError('Invalid EditorialStatus');
  }
  return value as EditorialStatus;
}

export function parseSensitivity(value: unknown): Sensitivity {
  if (typeof value !== 'string' || !SENSITIVITIES.has(value)) {
    throw new ValidationError('Invalid Sensitivity');
  }
  return value as Sensitivity;
}

export function parseApprovalState(value: unknown): ApprovalState {
  if (typeof value !== 'string' || !APPROVAL_STATES.has(value)) {
    throw new ValidationError('Invalid ApprovalState');
  }
  return value as ApprovalState;
}

export function parsePublicationChannel(value: unknown): PublicationChannel {
  if (typeof value !== 'string' || !PUBLICATION_CHANNELS.has(value)) {
    throw new ValidationError('Invalid PublicationChannel');
  }
  return value as PublicationChannel;
}

export function assertContentItemIdentifiers(item: {
  id: unknown;
  authorId: unknown;
  slug: unknown;
}): void {
  requireNonEmptyId(item.id, 'ContentItem.id');
  requireNonEmptyId(item.authorId, 'ContentItem.authorId');
  requireNonEmptyId(item.slug, 'ContentItem.slug');
}
