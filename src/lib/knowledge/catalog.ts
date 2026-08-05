import {
  ConflictError,
  EditorialRepository,
  type KnowledgeDocumentRecord,
} from '../editorial/repository.ts';
import { UnauthorizedError } from '../editorial/validation.ts';

export type KnowledgeDocument = KnowledgeDocumentRecord;

export type IngestKnowledgeInput = {
  document: KnowledgeDocument;
  actorId: string;
  approvedSourceIds: ReadonlySet<string>;
  allowManualUpload: boolean;
};

/**
 * Only approved-source catalog URLs or explicitly flagged manual uploads
 * may enter the knowledge index.
 */
export function assertIngestAllowed(input: IngestKnowledgeInput): void {
  const { document, approvedSourceIds, allowManualUpload } = input;
  const sourceAllowed = approvedSourceIds.has(document.sourceUrl);
  if (!sourceAllowed && !allowManualUpload) {
    throw new UnauthorizedError(
      'La fuente no está en el catálogo aprobado ni es una carga manual autorizada',
    );
  }
  if (!document.approved) {
    throw new UnauthorizedError(
      'El documento de conocimiento debe estar aprobado antes de indexarse',
    );
  }
}

export async function ingestKnowledgeDocument(
  repository: EditorialRepository,
  input: IngestKnowledgeInput,
): Promise<KnowledgeDocument> {
  assertIngestAllowed(input);

  try {
    await repository.upsertKnowledgeDocument(input.document, input.actorId);
  } catch (error) {
    if (error instanceof ConflictError) {
      throw error;
    }
    throw new Error('Unable to ingest knowledge document');
  }

  return input.document;
}
