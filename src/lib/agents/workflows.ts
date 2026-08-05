/**
 * Editorial agent workflow helpers and approval gates.
 * Durable Object / WorkflowEntrypoint classes live in editorial-agent.ts
 * so Node tests can import this module without cloudflare:workers.
 */
import type { ApprovalState, Citation } from '../editorial/contracts.ts';
import type { EditorialRepository } from '../editorial/repository.ts';
import type { RetrievalResult } from '../knowledge/retrieval.ts';

export class ApprovalRequiredError extends Error {
  readonly code = 'needs_approval' as const;

  constructor(message = 'Se requiere aprobación humana') {
    super(message);
    this.name = 'ApprovalRequiredError';
  }
}

export type EditorialAgentStep =
  | 'brief'
  | 'research_plan'
  | 'retrieval'
  | 'fact_matrix'
  | 'draft'
  | 'citation_tone_check'
  | 'channel_package';

export type AgentAuditEntry = Record<string, unknown> & {
  action: string;
};

export type EditorialAgentState = {
  sessionId: string;
  step: EditorialAgentStep;
  brief: string;
  actorEmail: string;
  promptVersion: string;
  model: string;
  draftMarkdown: string;
  citations: Citation[];
  approvalState: ApprovalState;
  audit: AgentAuditEntry[];
};

export type SideEffectTool =
  | 'publish'
  | 'send_newsletter'
  | 'knowledge_ingest'
  | 'config_change';

export type EditorialPublishParams = {
  publicationRequestId: string;
  channel: 'linkedin' | 'resend' | 'rss' | 'partner';
  approvalState: ApprovalState;
  actorEmail: string;
  promptVersion: string;
  model: string;
  contentItemId: string;
};

const WORKFLOW_STEPS: EditorialAgentStep[] = [
  'brief',
  'research_plan',
  'retrieval',
  'fact_matrix',
  'draft',
  'citation_tone_check',
  'channel_package',
];

export function assertWorkflowMayExecute(approvalState: ApprovalState): void {
  if (approvalState !== 'approved') {
    throw new ApprovalRequiredError(
      `Workflow bloqueado: approvalState=${approvalState}`,
    );
  }
}

export function createInitialAgentState(input: {
  brief: string;
  actorEmail: string;
  promptVersion?: string;
  model?: string;
  sessionId?: string;
}): EditorialAgentState {
  const promptVersion = input.promptVersion ?? 'editorial-v1';
  const model = input.model ?? '@cf/meta/llama-3.1-8b-instruct';
  return {
    sessionId: input.sessionId ?? `agent_${crypto.randomUUID()}`,
    step: 'brief',
    brief: input.brief,
    actorEmail: input.actorEmail,
    promptVersion,
    model,
    draftMarkdown: '',
    citations: [],
    approvalState: 'draft',
    audit: [
      {
        action: 'session_start',
        promptVersion,
        model,
        actorEmail: input.actorEmail,
        brief: input.brief,
      },
    ],
  };
}

export function buildFallbackDraftMarkdown(
  brief: string,
  citations: Citation[],
): string {
  return [
    '# Borrador',
    '',
    brief,
    '',
    ...citations.map(
      (citation, index) =>
        `${index + 1}. ${citation.claim} — ${citation.sourceUrl}`,
    ),
  ].join('\n');
}

export function advanceAgentWorkflow(
  state: EditorialAgentState,
  retrieval?: RetrievalResult,
  draftOverride?: string,
): EditorialAgentState {
  const index = WORKFLOW_STEPS.indexOf(state.step);
  const nextStep =
    WORKFLOW_STEPS[Math.min(index + 1, WORKFLOW_STEPS.length - 1)] ?? state.step;
  const citations = retrieval?.citations ?? state.citations;
  const shouldMaterializeDraft =
    state.step === 'fact_matrix' || state.step === 'draft';
  const draftMarkdown = shouldMaterializeDraft
    ? (draftOverride ??
      buildFallbackDraftMarkdown(state.brief, citations))
    : state.draftMarkdown;

  return {
    ...state,
    step: nextStep,
    citations,
    draftMarkdown,
    audit: [
      ...state.audit,
      {
        action: 'advance',
        from: state.step,
        to: nextStep,
        citationCount: citations.length,
        citations: citations.map((citation) => citation.id),
        model: state.model,
        promptVersion: state.promptVersion,
        draftSource: draftOverride ? 'ai_gateway' : shouldMaterializeDraft ? 'fallback' : undefined,
      },
    ],
  };
}

export function recordInferenceAudit(
  state: EditorialAgentState,
  inference: {
    routedViaGateway: boolean;
    degraded: boolean;
    reason?: string;
    prompt: string;
    model: string;
    promptVersion: string;
  },
): EditorialAgentState {
  return {
    ...state,
    audit: [
      ...state.audit,
      {
        action: 'inference',
        routedViaGateway: inference.routedViaGateway,
        degraded: inference.degraded,
        reason: inference.reason,
        prompt: inference.prompt,
        model: inference.model,
        promptVersion: inference.promptVersion,
        citations: state.citations.map((citation) => citation.id),
      },
    ],
  };
}

export function requestSideEffectTool(input: {
  state: EditorialAgentState;
  tool: SideEffectTool;
  actorEmail: string;
}): EditorialAgentState {
  if (input.actorEmail !== input.state.actorEmail) {
    throw new ApprovalRequiredError(
      'La herramienta requiere la identidad de Arturo',
    );
  }

  return {
    ...input.state,
    approvalState: 'needs_approval',
    audit: [
      ...input.state.audit,
      {
        action: 'tool_needs_approval',
        tool: input.tool,
        approvalState: 'needs_approval',
        model: input.state.model,
        promptVersion: input.state.promptVersion,
        citations: input.state.citations.map((citation) => citation.id),
      },
    ],
  };
}

export function executeApprovedSideEffect(input: {
  state: EditorialAgentState;
  tool: SideEffectTool;
}): EditorialAgentState {
  assertWorkflowMayExecute(input.state.approvalState);
  return {
    ...input.state,
    approvalState: 'executed',
    audit: [
      ...input.state.audit,
      {
        action: 'tool_executed',
        tool: input.tool,
        model: input.state.model,
        promptVersion: input.state.promptVersion,
        citations: input.state.citations.map((citation) => citation.id),
      },
    ],
  };
}

/**
 * Writes in-memory agent audit entries to D1 audit_events.
 * Only persists entries from `fromIndex` onward (idempotent batching).
 */
export async function persistAgentAuditEntries(input: {
  repository: Pick<EditorialRepository, 'recordAuditEvent'>;
  state: EditorialAgentState;
  fromIndex?: number;
}): Promise<number> {
  const start = input.fromIndex ?? 0;
  const pending = input.state.audit.slice(start);
  for (const entry of pending) {
    await input.repository.recordAuditEvent({
      entityType: 'agent_session',
      entityId: input.state.sessionId,
      action: String(entry.action),
      actorId: input.state.actorEmail,
      payload: {
        ...entry,
        promptVersion: input.state.promptVersion,
        model: input.state.model,
        step: input.state.step,
        approvalState: input.state.approvalState,
        citationIds: input.state.citations.map((citation) => citation.id),
      },
    });
  }
  return pending.length;
}
