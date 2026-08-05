import type { Citation, Sensitivity } from '../editorial/contracts.ts';
import type { EditorialRepository } from '../editorial/repository.ts';
import type { KnowledgeDocument } from './catalog.ts';

export type VectorQuery = {
  query: (
    vector: number[],
    options?: { topK?: number; returnMetadata?: boolean },
  ) => Promise<{
    matches: Array<{
      id: string;
      score: number;
      metadata?: Record<string, string | number | boolean | null>;
    }>;
  }>;
};

export type RetrievalQuery = {
  text: string;
  actorSensitivity: Sensitivity;
  allowExternalModel: boolean;
  topK?: number;
};

export type RetrievalResult = {
  documents: KnowledgeDocument[];
  citations: Citation[];
  degraded: boolean;
  reason?: 'vectorize_unavailable' | 'filtered';
};

const SENSITIVITY_RANK: Record<Sensitivity, number> = {
  public: 0,
  internal: 1,
  confidential: 2,
};

export function isSensitivityAllowed(
  documentSensitivity: Sensitivity,
  actorSensitivity: Sensitivity,
  allowExternalModel: boolean,
): boolean {
  if (allowExternalModel && documentSensitivity === 'confidential') {
    return false;
  }
  return (
    SENSITIVITY_RANK[documentSensitivity] <= SENSITIVITY_RANK[actorSensitivity]
  );
}

function toCitation(
  document: KnowledgeDocument,
  contentItemId: string,
): Citation {
  return {
    id: `cite_knowledge_${document.id}`,
    contentItemId,
    sourceId: document.id,
    claim: document.title,
    excerpt: document.excerpt,
    sourceUrl: document.sourceUrl,
    publishedAt: document.publishedAt ?? null,
    verifiedAt: document.collectedAt,
  };
}

export async function retrieveKnowledge(input: {
  repository: EditorialRepository;
  vectorize?: VectorQuery | null;
  query: RetrievalQuery;
  contentItemId?: string;
}): Promise<RetrievalResult> {
  const { repository, vectorize, query } = input;
  const contentItemId = input.contentItemId ?? 'research_session';
  const topK = query.topK ?? 5;

  let candidateIds: string[] = [];
  let degraded = false;
  let reason: RetrievalResult['reason'];

  if (vectorize) {
    try {
      const embedding = Array.from({ length: 8 }, (_, index) =>
        (query.text.length + index) % 17,
      );
      const matches = await vectorize.query(embedding, {
        topK,
        returnMetadata: true,
      });
      candidateIds = matches.matches.map((match) => match.id);
    } catch {
      degraded = true;
      reason = 'vectorize_unavailable';
    }
  } else {
    degraded = true;
    reason = 'vectorize_unavailable';
  }

  const keywordDocs = await repository.searchKnowledgeDocuments(query.text, {
    limit: topK,
  });

  const byId = new Map(keywordDocs.map((doc) => [doc.id, doc]));
  if (candidateIds.length > 0) {
    for (const id of candidateIds) {
      if (!byId.has(id)) {
        const doc = await repository.getKnowledgeDocumentById(id);
        if (doc) {
          byId.set(id, doc);
        }
      }
    }
  }

  const documents = [...byId.values()].filter((document) =>
    isSensitivityAllowed(
      document.sensitivity,
      query.actorSensitivity,
      query.allowExternalModel,
    ),
  );

  if (documents.length === 0 && byId.size > 0) {
    reason = 'filtered';
  }

  return {
    documents,
    citations: documents.map((document) =>
      toCitation(document, contentItemId),
    ),
    degraded,
    reason,
  };
}
