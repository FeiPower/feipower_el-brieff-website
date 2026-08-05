/**
 * ADR-4: Workers AI is the default model path; all calls route through AI Gateway.
 * External providers are only allowed when tool policy permits and no confidential
 * documents are in context.
 */
import type { Citation, Sensitivity } from '../editorial/contracts.ts';

export type WorkersAiRunner = {
  run: (
    model: string,
    inputs: Record<string, unknown>,
    options?: {
      gateway?: {
        id: string;
        skipCache?: boolean;
        cacheTtl?: number;
      };
    },
  ) => Promise<unknown>;
};

export type DraftInferenceInput = {
  ai: WorkersAiRunner;
  gatewayId: string;
  model: string;
  promptVersion: string;
  brief: string;
  citations: Citation[];
  /** When true, confidential context must not leave Workers AI / gateway-only path. */
  allowExternalModel: boolean;
  documentSensitivities: Sensitivity[];
};

export type DraftInferenceResult = {
  draftMarkdown: string;
  routedViaGateway: boolean;
  degraded: boolean;
  reason?: 'provider_failed' | 'external_model_blocked';
  prompt: string;
  rawText: string;
};

const WORKERS_AI_PREFIX = '@cf/';

export function isWorkersAiModel(model: string): boolean {
  return model.startsWith(WORKERS_AI_PREFIX);
}

export function assertExternalModelPolicy(input: {
  model: string;
  allowExternalModel: boolean;
  documentSensitivities: Sensitivity[];
}): void {
  const hasConfidential = input.documentSensitivities.includes('confidential');
  if (isWorkersAiModel(input.model)) {
    return;
  }
  if (!input.allowExternalModel || hasConfidential) {
    throw new Error('external_model_blocked');
  }
}

export function buildEditorialDraftPrompt(input: {
  brief: string;
  citations: Citation[];
  promptVersion: string;
}): string {
  const citationBlock =
    input.citations.length === 0
      ? '(sin citas verificadas — marcar opiniones como tales)'
      : input.citations
          .map(
            (citation, index) =>
              `${index + 1}. Claim: ${citation.claim}\n   Excerpt: ${citation.excerpt}\n   URL: ${citation.sourceUrl}`,
          )
          .join('\n');

  return [
    `Prompt version: ${input.promptVersion}`,
    'Eres el asistente editorial de El Brieff (es-MX).',
    'Redacta un borrador de columna en Markdown.',
    'Toda afirmación factual debe citar una fuente numerada de la lista.',
    'No inventes URLs ni datos. Separa claramente opinión de hecho.',
    '',
    `Brief: ${input.brief}`,
    '',
    'Fuentes aprobadas:',
    citationBlock,
  ].join('\n');
}

export function buildFallbackDraft(input: {
  brief: string;
  citations: Citation[];
}): string {
  return [
    '# Borrador',
    '',
    input.brief,
    '',
    ...input.citations.map(
      (citation, index) =>
        `${index + 1}. ${citation.claim} — ${citation.sourceUrl}`,
    ),
  ].join('\n');
}

function extractTextFromAiResponse(response: unknown): string {
  if (typeof response === 'string' && response.trim()) {
    return response.trim();
  }
  if (response && typeof response === 'object') {
    const record = response as Record<string, unknown>;
    if (typeof record.response === 'string' && record.response.trim()) {
      return record.response.trim();
    }
    if (typeof record.text === 'string' && record.text.trim()) {
      return record.text.trim();
    }
  }
  return '';
}

/**
 * Ideal ADR-4 path: always pass `gateway.id`; default model is Workers AI.
 * On provider failure, return a degraded fallback draft (retain draft state;
 * never create a delivery from this path).
 */
export async function generateEditorialDraft(
  input: DraftInferenceInput,
): Promise<DraftInferenceResult> {
  const prompt = buildEditorialDraftPrompt({
    brief: input.brief,
    citations: input.citations,
    promptVersion: input.promptVersion,
  });
  const fallback = buildFallbackDraft({
    brief: input.brief,
    citations: input.citations,
  });

  try {
    assertExternalModelPolicy({
      model: input.model,
      allowExternalModel: input.allowExternalModel,
      documentSensitivities: input.documentSensitivities,
    });
  } catch {
    return {
      draftMarkdown: fallback,
      routedViaGateway: false,
      degraded: true,
      reason: 'external_model_blocked',
      prompt,
      rawText: '',
    };
  }

  if (!input.gatewayId.trim()) {
    return {
      draftMarkdown: fallback,
      routedViaGateway: false,
      degraded: true,
      reason: 'provider_failed',
      prompt,
      rawText: '',
    };
  }

  try {
    const response = await input.ai.run(
      input.model,
      {
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1200,
      },
      {
        gateway: {
          id: input.gatewayId,
        },
      },
    );
    const rawText = extractTextFromAiResponse(response);
    if (!rawText) {
      return {
        draftMarkdown: fallback,
        routedViaGateway: true,
        degraded: true,
        reason: 'provider_failed',
        prompt,
        rawText: '',
      };
    }
    return {
      draftMarkdown: rawText,
      routedViaGateway: true,
      degraded: false,
      prompt,
      rawText,
    };
  } catch {
    return {
      draftMarkdown: fallback,
      routedViaGateway: false,
      degraded: true,
      reason: 'provider_failed',
      prompt,
      rawText: '',
    };
  }
}
