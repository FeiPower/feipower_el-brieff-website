import {
  type ApprovalState,
  type Citation,
  type ContentItem,
  type ContentKind,
  type EditorialStatus,
  type PublicationChannel,
  type PublicationRequest,
  type Sensitivity,
  parseApprovalState,
  parseContentKind,
  parseEditorialStatus,
  parsePublicationChannel,
  parseSensitivity,
} from './contracts.ts';
export type KnowledgeDocumentRecord = {
  id: string;
  title: string;
  sourceUrl: string;
  excerpt: string;
  sensitivity: Sensitivity;
  license: string;
  collectedAt: string;
  publishedAt?: string | null;
  r2Key?: string | null;
  approved: boolean;
};

export class ConflictError extends Error {
  readonly code = 'conflict' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class NotFoundError extends Error {
  readonly code = 'not_found' as const;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

type D1PreparedStatementLike = {
  bind: (...values: unknown[]) => D1PreparedStatementLike;
  first: <T = unknown>() => Promise<T | null>;
  all: <T = unknown>() => Promise<{ results: T[] }>;
  run: () => Promise<{ success?: boolean; meta?: { changes?: number } }>;
};

type D1DatabaseLike = {
  prepare: (query: string) => D1PreparedStatementLike;
  batch?: (statements: D1PreparedStatementLike[]) => Promise<unknown[]>;
};

type ContentItemRow = {
  id: string;
  kind: string;
  status: string;
  slug: string;
  title: string;
  summary: string;
  body_markdown: string;
  author_id: string;
  published_at: string | null;
  updated_at: string;
  canonical_url: string | null;
};

type CitationRow = {
  id: string;
  content_item_id: string;
  source_id: string;
  claim: string;
  excerpt: string;
  source_url: string;
  published_at: string | null;
  verified_at: string;
};

type PublicationRequestRow = {
  id: string;
  content_item_id: string;
  channel: string;
  payload_version: number;
  approval_state: string;
  idempotency_key: string;
  scheduled_at: string | null;
};

export type CreateContentInput = {
  id: string;
  kind: ContentKind;
  status: EditorialStatus;
  slug: string;
  title: string;
  summary: string;
  bodyMarkdown: string;
  authorId: string;
  publishedAt?: string | null;
  canonicalUrl?: string | null;
};

export type UpdateContentInput = {
  title?: string;
  summary?: string;
  bodyMarkdown?: string;
  status?: EditorialStatus;
  publishedAt?: string | null;
  canonicalUrl?: string | null;
  slug?: string;
};

export type CreateCitationInput = {
  id: string;
  contentItemId: string;
  sourceId: string;
  claim: string;
  excerpt: string;
  sourceUrl: string;
  publishedAt?: string | null;
  verifiedAt: string;
};

export type CreatePublicationRequestInput = {
  id: string;
  contentItemId: string;
  channel: PublicationChannel;
  payloadVersion: number;
  approvalState: ApprovalState;
  idempotencyKey: string;
  scheduledAt?: string | null;
};

export type AuditEvent = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  payloadJson: string;
  createdAt: string;
};

function mapContentItem(row: ContentItemRow): ContentItem {
  return {
    id: row.id,
    kind: parseContentKind(row.kind),
    status: parseEditorialStatus(row.status),
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    bodyMarkdown: row.body_markdown,
    authorId: row.author_id,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    canonicalUrl: row.canonical_url,
  };
}

function mapCitation(row: CitationRow): Citation {
  return {
    id: row.id,
    contentItemId: row.content_item_id,
    sourceId: row.source_id,
    claim: row.claim,
    excerpt: row.excerpt,
    sourceUrl: row.source_url,
    publishedAt: row.published_at,
    verifiedAt: row.verified_at,
  };
}

function mapPublicationRequest(row: PublicationRequestRow): PublicationRequest {
  return {
    id: row.id,
    contentItemId: row.content_item_id,
    channel: parsePublicationChannel(row.channel),
    payloadVersion: row.payload_version,
    approvalState: parseApprovalState(row.approval_state),
    idempotencyKey: row.idempotency_key,
    scheduledAt: row.scheduled_at,
  };
}

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return message.includes('unique') || message.includes('constraint');
}

function toSafeError(error: unknown, fallback: string): Error {
  if (error instanceof ConflictError || error instanceof NotFoundError) {
    return error;
  }
  if (isUniqueViolation(error)) {
    return new ConflictError(fallback);
  }
  return new Error(fallback);
}

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export class EditorialRepository {
  private readonly db: D1DatabaseLike;

  constructor(db: D1DatabaseLike) {
    this.db = db;
  }

  async ensureAuthor(input: {
    id: string;
    name: string;
    email?: string | null;
    handle?: string | null;
  }): Promise<void> {
    const timestamp = nowIso();
    try {
      await this.db
        .prepare(
          `INSERT INTO authors (id, name, email, handle, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name = excluded.name,
             email = excluded.email,
             handle = excluded.handle,
             updated_at = excluded.updated_at`,
        )
        .bind(
          input.id,
          input.name,
          input.email ?? null,
          input.handle ?? null,
          timestamp,
          timestamp,
        )
        .run();
    } catch (error) {
      throw toSafeError(error, 'Unable to persist author');
    }
  }

  async createContentItem(
    input: CreateContentInput,
    actorId: string,
  ): Promise<ContentItem> {
    const updatedAt = nowIso();
    const publishedAt = input.publishedAt ?? null;
    const canonicalUrl = input.canonicalUrl ?? null;

    try {
      await this.db
        .prepare(
          `INSERT INTO content_items (
             id, kind, status, slug, title, summary, body_markdown,
             author_id, published_at, updated_at, canonical_url
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          input.id,
          input.kind,
          input.status,
          input.slug,
          input.title,
          input.summary,
          input.bodyMarkdown,
          input.authorId,
          publishedAt,
          updatedAt,
          canonicalUrl,
        )
        .run();

      await this.createVersion({
        contentItemId: input.id,
        title: input.title,
        summary: input.summary,
        bodyMarkdown: input.bodyMarkdown,
        status: input.status,
        actorId,
      });

      await this.writeAudit({
        entityType: 'content_item',
        entityId: input.id,
        action: 'create',
        actorId,
        payload: { kind: input.kind, slug: input.slug, status: input.status },
      });
    } catch (error) {
      throw toSafeError(error, 'Unable to create content item');
    }

    return this.getContentItemById(input.id);
  }

  async getContentItemById(id: string): Promise<ContentItem> {
    let row: ContentItemRow | null;
    try {
      row = await this.db
        .prepare(
          `SELECT id, kind, status, slug, title, summary, body_markdown,
                  author_id, published_at, updated_at, canonical_url
           FROM content_items WHERE id = ?`,
        )
        .bind(id)
        .first<ContentItemRow>();
    } catch {
      throw new Error('Unable to read content item');
    }

    if (!row) {
      throw new NotFoundError('Content item not found');
    }
    return mapContentItem(row);
  }

  async getContentItemBySlug(slug: string): Promise<ContentItem> {
    let row: ContentItemRow | null;
    try {
      row = await this.db
        .prepare(
          `SELECT id, kind, status, slug, title, summary, body_markdown,
                  author_id, published_at, updated_at, canonical_url
           FROM content_items WHERE slug = ?`,
        )
        .bind(slug)
        .first<ContentItemRow>();
    } catch {
      throw new Error('Unable to read content item');
    }

    if (!row) {
      throw new NotFoundError('Content item not found');
    }
    return mapContentItem(row);
  }

  async listPublishedByKind(kind: ContentKind): Promise<ContentItem[]> {
    try {
      const result = await this.db
        .prepare(
          `SELECT id, kind, status, slug, title, summary, body_markdown,
                  author_id, published_at, updated_at, canonical_url
           FROM content_items
           WHERE kind = ? AND status IN ('published', 'syndicated')
           ORDER BY published_at DESC`,
        )
        .bind(kind)
        .all<ContentItemRow>();
      return result.results.map(mapContentItem);
    } catch {
      throw new Error('Unable to list published content');
    }
  }

  async listEditorialQueue(limit = 50): Promise<ContentItem[]> {
    try {
      const result = await this.db
        .prepare(
          `SELECT id, kind, status, slug, title, summary, body_markdown,
                  author_id, published_at, updated_at, canonical_url
           FROM content_items
           ORDER BY updated_at DESC
           LIMIT ?`,
        )
        .bind(limit)
        .all<ContentItemRow>();
      return result.results.map(mapContentItem);
    } catch {
      throw new Error('Unable to list editorial queue');
    }
  }

  async persistValidatedDraft(
    actorId: string,
    draft: {
      kind: ContentKind;
      status: EditorialStatus;
      slug: string;
      title: string;
      summary: string;
      bodyMarkdown: string;
      citations: Array<{
        claim: string;
        excerpt: string;
        sourceUrl: string;
      }>;
    },
  ): Promise<ContentItem> {
    await this.ensureAuthor({
      id: actorId,
      name: actorId,
      email: actorId,
    });

    const content = await this.createContentItem(
      {
        id: newId('content'),
        kind: draft.kind,
        status: draft.status,
        slug: draft.slug,
        title: draft.title,
        summary: draft.summary,
        bodyMarkdown: draft.bodyMarkdown,
        authorId: actorId,
      },
      actorId,
    );

    for (const citation of draft.citations) {
      const sourceId = newId('source');
      await this.ensureSource({
        id: sourceId,
        title: citation.claim.slice(0, 120),
        sourceUrl: citation.sourceUrl,
        approved: true,
        sensitivity: 'public',
      });
      await this.addCitation(
        {
          id: newId('cite'),
          contentItemId: content.id,
          sourceId,
          claim: citation.claim,
          excerpt: citation.excerpt,
          sourceUrl: citation.sourceUrl,
          verifiedAt: nowIso(),
        },
        actorId,
      );
    }

    return content;
  }

  async recordAuditEvent(input: {
    entityType: string;
    entityId: string;
    action: string;
    actorId: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    await this.writeAudit(input);
  }

  async updateContentItem(
    id: string,
    patch: UpdateContentInput,
    actorId: string,
  ): Promise<ContentItem> {
    const current = await this.getContentItemById(id);
    const next: ContentItem = {
      ...current,
      title: patch.title ?? current.title,
      summary: patch.summary ?? current.summary,
      bodyMarkdown: patch.bodyMarkdown ?? current.bodyMarkdown,
      status: patch.status ?? current.status,
      publishedAt:
        patch.publishedAt !== undefined ? patch.publishedAt : current.publishedAt,
      canonicalUrl:
        patch.canonicalUrl !== undefined
          ? patch.canonicalUrl
          : current.canonicalUrl,
      slug: patch.slug ?? current.slug,
      updatedAt: nowIso(),
    };

    try {
      await this.db
        .prepare(
          `UPDATE content_items
           SET title = ?, summary = ?, body_markdown = ?, status = ?,
               published_at = ?, canonical_url = ?, slug = ?, updated_at = ?
           WHERE id = ?`,
        )
        .bind(
          next.title,
          next.summary,
          next.bodyMarkdown,
          next.status,
          next.publishedAt,
          next.canonicalUrl,
          next.slug,
          next.updatedAt,
          id,
        )
        .run();

      await this.createVersion({
        contentItemId: id,
        title: next.title,
        summary: next.summary,
        bodyMarkdown: next.bodyMarkdown,
        status: next.status,
        actorId,
      });

      await this.writeAudit({
        entityType: 'content_item',
        entityId: id,
        action: 'update',
        actorId,
        payload: {
          status: next.status,
          slug: next.slug,
        },
      });
    } catch (error) {
      throw toSafeError(error, 'Unable to update content item');
    }

    return this.getContentItemById(id);
  }

  async addCitation(
    input: CreateCitationInput,
    actorId: string,
  ): Promise<Citation> {
    try {
      await this.db
        .prepare(
          `INSERT INTO citations (
             id, content_item_id, source_id, claim, excerpt,
             source_url, published_at, verified_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          input.id,
          input.contentItemId,
          input.sourceId,
          input.claim,
          input.excerpt,
          input.sourceUrl,
          input.publishedAt ?? null,
          input.verifiedAt,
        )
        .run();

      await this.writeAudit({
        entityType: 'citation',
        entityId: input.id,
        action: 'create',
        actorId,
        payload: {
          contentItemId: input.contentItemId,
          sourceId: input.sourceId,
        },
      });
    } catch (error) {
      throw toSafeError(error, 'Unable to create citation');
    }

    return this.getCitationById(input.id);
  }

  async ensureSource(input: {
    id: string;
    title: string;
    sourceUrl: string;
    sensitivity?: 'public' | 'internal' | 'confidential';
    approved?: boolean;
  }): Promise<void> {
    const timestamp = nowIso();
    try {
      await this.db
        .prepare(
          `INSERT INTO sources (
             id, title, source_url, publisher, published_at, license,
             sensitivity, approved, created_at, updated_at
           ) VALUES (?, ?, ?, NULL, NULL, '', ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             title = excluded.title,
             source_url = excluded.source_url,
             sensitivity = excluded.sensitivity,
             approved = excluded.approved,
             updated_at = excluded.updated_at`,
        )
        .bind(
          input.id,
          input.title,
          input.sourceUrl,
          input.sensitivity ?? 'public',
          input.approved === false ? 0 : 1,
          timestamp,
          timestamp,
        )
        .run();
    } catch (error) {
      throw toSafeError(error, 'Unable to persist source');
    }
  }

  async setPublishMetadata(
    contentItemId: string,
    input: {
      category: string;
      disclosure: string;
      featuredAssetId: string;
    },
    actorId: string,
  ): Promise<void> {
    try {
      await this.db
        .prepare(
          `UPDATE content_items
           SET category = ?, disclosure = ?, featured_asset_id = ?, updated_at = ?
           WHERE id = ?`,
        )
        .bind(
          input.category,
          input.disclosure,
          input.featuredAssetId,
          nowIso(),
          contentItemId,
        )
        .run();

      await this.writeAudit({
        entityType: 'content_item',
        entityId: contentItemId,
        action: 'set_publish_metadata',
        actorId,
        payload: input,
      });
    } catch (error) {
      throw toSafeError(error, 'Unable to set publish metadata');
    }
  }

  async getSyndicationRule(
    contentItemId: string,
  ): Promise<'exclude' | 'excerpt' | 'full_after_delay' | 'full'> {
    try {
      const row = await this.db
        .prepare(
          `SELECT syndication_rule FROM content_items WHERE id = ?`,
        )
        .bind(contentItemId)
        .first<{ syndication_rule: string }>();
      if (!row) {
        throw new NotFoundError('Content item not found');
      }
      const rule = row.syndication_rule;
      if (
        rule === 'exclude' ||
        rule === 'excerpt' ||
        rule === 'full_after_delay' ||
        rule === 'full'
      ) {
        return rule;
      }
      return 'exclude';
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Unable to read syndication rule');
    }
  }

  async setSyndicationRule(
    contentItemId: string,
    rule: 'exclude' | 'excerpt' | 'full_after_delay' | 'full',
    actorId: string,
  ): Promise<void> {
    try {
      await this.db
        .prepare(
          `UPDATE content_items SET syndication_rule = ?, updated_at = ? WHERE id = ?`,
        )
        .bind(rule, nowIso(), contentItemId)
        .run();
      await this.writeAudit({
        entityType: 'content_item',
        entityId: contentItemId,
        action: 'set_syndication_rule',
        actorId,
        payload: { rule },
      });
    } catch (error) {
      throw toSafeError(error, 'Unable to set syndication rule');
    }
  }

  async getPublishMetadata(contentItemId: string): Promise<{
    category: string | null;
    disclosure: string | null;
    featuredAssetId: string | null;
  }> {
    try {
      const row = await this.db
        .prepare(
          `SELECT category, disclosure, featured_asset_id
           FROM content_items WHERE id = ?`,
        )
        .bind(contentItemId)
        .first<{
          category: string | null;
          disclosure: string | null;
          featured_asset_id: string | null;
        }>();

      if (!row) {
        throw new NotFoundError('Content item not found');
      }

      return {
        category: row.category,
        disclosure: row.disclosure,
        featuredAssetId: row.featured_asset_id,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Unable to read publish metadata');
    }
  }

  async ensureAsset(input: {
    id: string;
    contentItemId: string;
    r2Key: string;
    contentType: string;
    altText?: string;
  }): Promise<void> {
    try {
      await this.db
        .prepare(
          `INSERT INTO assets (id, content_item_id, r2_key, content_type, alt_text, created_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             content_item_id = excluded.content_item_id,
             r2_key = excluded.r2_key,
             content_type = excluded.content_type,
             alt_text = excluded.alt_text`,
        )
        .bind(
          input.id,
          input.contentItemId,
          input.r2Key,
          input.contentType,
          input.altText ?? '',
          nowIso(),
        )
        .run();
    } catch (error) {
      throw toSafeError(error, 'Unable to persist asset');
    }
  }

  async listCitations(contentItemId: string): Promise<Citation[]> {
    try {
      const result = await this.db
        .prepare(
          `SELECT id, content_item_id, source_id, claim, excerpt,
                  source_url, published_at, verified_at
           FROM citations WHERE content_item_id = ?`,
        )
        .bind(contentItemId)
        .all<CitationRow>();
      return result.results.map(mapCitation);
    } catch {
      throw new Error('Unable to list citations');
    }
  }

  async createPublicationRequest(
    input: CreatePublicationRequestInput,
    actorId: string,
  ): Promise<PublicationRequest> {
    const timestamp = nowIso();
    try {
      await this.db
        .prepare(
          `INSERT INTO publication_requests (
             id, content_item_id, channel, payload_version, approval_state,
             idempotency_key, scheduled_at, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          input.id,
          input.contentItemId,
          input.channel,
          input.payloadVersion,
          input.approvalState,
          input.idempotencyKey,
          input.scheduledAt ?? null,
          timestamp,
          timestamp,
        )
        .run();

      await this.writeAudit({
        entityType: 'publication_request',
        entityId: input.id,
        action: 'create',
        actorId,
        payload: {
          channel: input.channel,
          idempotencyKey: input.idempotencyKey,
          approvalState: input.approvalState,
        },
      });
    } catch (error) {
      throw toSafeError(error, 'Unable to create publication request');
    }

    return this.getPublicationRequestById(input.id);
  }

  async getPublicationRequestByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<PublicationRequest | null> {
    try {
      const row = await this.db
        .prepare(
          `SELECT id, content_item_id, channel, payload_version,
                  approval_state, idempotency_key, scheduled_at
           FROM publication_requests WHERE idempotency_key = ?`,
        )
        .bind(idempotencyKey)
        .first<PublicationRequestRow>();
      return row ? mapPublicationRequest(row) : null;
    } catch {
      throw new Error('Unable to read publication request');
    }
  }

  async getPublicationRequestById(id: string): Promise<PublicationRequest> {
    let row: PublicationRequestRow | null;
    try {
      row = await this.db
        .prepare(
          `SELECT id, content_item_id, channel, payload_version,
                  approval_state, idempotency_key, scheduled_at
           FROM publication_requests WHERE id = ?`,
        )
        .bind(id)
        .first<PublicationRequestRow>();
    } catch {
      throw new Error('Unable to read publication request');
    }

    if (!row) {
      throw new NotFoundError('Publication request not found');
    }
    return mapPublicationRequest(row);
  }

  async upsertKnowledgeDocument(
    document: KnowledgeDocumentRecord,
    actorId: string,
  ): Promise<void> {
    const timestamp = nowIso();
    try {
      await this.db
        .prepare(
          `INSERT INTO knowledge_documents (
             id, title, source_url, excerpt, sensitivity, license,
             collected_at, published_at, r2_key, approved, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             title = excluded.title,
             source_url = excluded.source_url,
             excerpt = excluded.excerpt,
             sensitivity = excluded.sensitivity,
             license = excluded.license,
             collected_at = excluded.collected_at,
             published_at = excluded.published_at,
             r2_key = excluded.r2_key,
             approved = excluded.approved,
             updated_at = excluded.updated_at`,
        )
        .bind(
          document.id,
          document.title,
          document.sourceUrl,
          document.excerpt,
          document.sensitivity,
          document.license,
          document.collectedAt,
          document.publishedAt ?? null,
          document.r2Key ?? null,
          document.approved ? 1 : 0,
          timestamp,
          timestamp,
        )
        .run();

      await this.writeAudit({
        entityType: 'knowledge_document',
        entityId: document.id,
        action: 'upsert',
        actorId,
        payload: {
          sensitivity: document.sensitivity,
          sourceUrl: document.sourceUrl,
        },
      });
    } catch (error) {
      throw toSafeError(error, 'Unable to upsert knowledge document');
    }
  }

  async getKnowledgeDocumentById(
    id: string,
  ): Promise<KnowledgeDocumentRecord | null> {
    try {
      const row = await this.db
        .prepare(
          `SELECT id, title, source_url, excerpt, sensitivity, license,
                  collected_at, published_at, r2_key, approved
           FROM knowledge_documents WHERE id = ?`,
        )
        .bind(id)
        .first<{
          id: string;
          title: string;
          source_url: string;
          excerpt: string;
          sensitivity: string;
          license: string;
          collected_at: string;
          published_at: string | null;
          r2_key: string | null;
          approved: number;
        }>();

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        title: row.title,
        sourceUrl: row.source_url,
        excerpt: row.excerpt,
        sensitivity: parseSensitivity(row.sensitivity),
        license: row.license,
        collectedAt: row.collected_at,
        publishedAt: row.published_at,
        r2Key: row.r2_key,
        approved: row.approved === 1,
      };
    } catch {
      throw new Error('Unable to read knowledge document');
    }
  }

  async searchKnowledgeDocuments(
    text: string,
    options?: { limit?: number },
  ): Promise<KnowledgeDocumentRecord[]> {
    const limit = options?.limit ?? 5;
    const needle = `%${text.trim()}%`;
    try {
      const result = await this.db
        .prepare(
          `SELECT id, title, source_url, excerpt, sensitivity, license,
                  collected_at, published_at, r2_key, approved
           FROM knowledge_documents
           WHERE approved = 1
             AND (title LIKE ? OR excerpt LIKE ? OR source_url LIKE ?)
           ORDER BY collected_at DESC
           LIMIT ?`,
        )
        .bind(needle, needle, needle, limit)
        .all<{
          id: string;
          title: string;
          source_url: string;
          excerpt: string;
          sensitivity: string;
          license: string;
          collected_at: string;
          published_at: string | null;
          r2_key: string | null;
          approved: number;
        }>();

      return result.results.map((row) => ({
        id: row.id,
        title: row.title,
        sourceUrl: row.source_url,
        excerpt: row.excerpt,
        sensitivity: parseSensitivity(row.sensitivity) as Sensitivity,
        license: row.license,
        collectedAt: row.collected_at,
        publishedAt: row.published_at,
        r2Key: row.r2_key,
        approved: row.approved === 1,
      }));
    } catch {
      throw new Error('Unable to search knowledge documents');
    }
  }

  async recordChannelDelivery(input: {
    id: string;
    publicationRequestId: string;
    channel: string;
    providerId: string | null;
    status: 'queued' | 'sent' | 'failed' | 'duplicate';
    attempt?: number;
    diagnostic?: string | null;
    actorId: string;
  }): Promise<void> {
    const timestamp = nowIso();
    try {
      await this.db
        .prepare(
          `INSERT INTO channel_deliveries (
             id, publication_request_id, channel, provider_id, status,
             attempt, diagnostic, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          input.id,
          input.publicationRequestId,
          input.channel,
          input.providerId,
          input.status,
          input.attempt ?? 1,
          input.diagnostic ?? null,
          timestamp,
          timestamp,
        )
        .run();

      await this.writeAudit({
        entityType: 'channel_delivery',
        entityId: input.id,
        action: 'record',
        actorId: input.actorId,
        payload: {
          channel: input.channel,
          status: input.status,
          providerId: input.providerId,
        },
      });
    } catch (error) {
      throw toSafeError(error, 'Unable to record channel delivery');
    }
  }

  async getLatestDelivery(
    publicationRequestId: string,
  ): Promise<{ providerId: string | null; status: string } | null> {
    try {
      const row = await this.db
        .prepare(
          `SELECT provider_id, status
           FROM channel_deliveries
           WHERE publication_request_id = ?
           ORDER BY created_at DESC
           LIMIT 1`,
        )
        .bind(publicationRequestId)
        .first<{ provider_id: string | null; status: string }>();
      if (!row) {
        return null;
      }
      return { providerId: row.provider_id, status: row.status };
    } catch {
      throw new Error('Unable to read channel delivery');
    }
  }

  async updatePublicationApproval(
    id: string,
    approvalState: ApprovalState,
    actorId: string,
  ): Promise<PublicationRequest> {
    try {
      await this.db
        .prepare(
          `UPDATE publication_requests
           SET approval_state = ?, updated_at = ?
           WHERE id = ?`,
        )
        .bind(approvalState, nowIso(), id)
        .run();
      await this.writeAudit({
        entityType: 'publication_request',
        entityId: id,
        action: 'approval_update',
        actorId,
        payload: { approvalState },
      });
    } catch (error) {
      throw toSafeError(error, 'Unable to update publication approval');
    }
    return this.getPublicationRequestById(id);
  }

  async listAuditEvents(entityType: string, entityId: string): Promise<AuditEvent[]> {
    try {
      const result = await this.db
        .prepare(
          `SELECT id, entity_type, entity_id, action, actor_id, payload_json, created_at
           FROM audit_events
           WHERE entity_type = ? AND entity_id = ?
           ORDER BY created_at ASC`,
        )
        .bind(entityType, entityId)
        .all<{
          id: string;
          entity_type: string;
          entity_id: string;
          action: string;
          actor_id: string;
          payload_json: string;
          created_at: string;
        }>();

      return result.results.map((row) => ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        action: row.action,
        actorId: row.actor_id,
        payloadJson: row.payload_json,
        createdAt: row.created_at,
      }));
    } catch {
      throw new Error('Unable to list audit events');
    }
  }

  private async getCitationById(id: string): Promise<Citation> {
    const row = await this.db
      .prepare(
        `SELECT id, content_item_id, source_id, claim, excerpt,
                source_url, published_at, verified_at
         FROM citations WHERE id = ?`,
      )
      .bind(id)
      .first<CitationRow>();

    if (!row) {
      throw new NotFoundError('Citation not found');
    }
    return mapCitation(row);
  }

  private async createVersion(input: {
    contentItemId: string;
    title: string;
    summary: string;
    bodyMarkdown: string;
    status: EditorialStatus;
    actorId: string;
  }): Promise<void> {
    const versionRow = await this.db
      .prepare(
        `SELECT COALESCE(MAX(version_number), 0) AS max_version
         FROM content_versions WHERE content_item_id = ?`,
      )
      .bind(input.contentItemId)
      .first<{ max_version: number }>();

    const versionNumber = (versionRow?.max_version ?? 0) + 1;

    await this.db
      .prepare(
        `INSERT INTO content_versions (
           id, content_item_id, version_number, title, summary,
           body_markdown, status, actor_id, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        newId('ver'),
        input.contentItemId,
        versionNumber,
        input.title,
        input.summary,
        input.bodyMarkdown,
        input.status,
        input.actorId,
        nowIso(),
      )
      .run();
  }

  private async writeAudit(input: {
    entityType: string;
    entityId: string;
    action: string;
    actorId: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO audit_events (
           id, entity_type, entity_id, action, actor_id, payload_json, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        newId('aud'),
        input.entityType,
        input.entityId,
        input.action,
        input.actorId,
        JSON.stringify(input.payload),
        nowIso(),
      )
      .run();
  }
}
