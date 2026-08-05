/**
 * Worker entry + Agents SDK EditorialAgent + EditorialPublishWorkflow.
 */
import { handle } from '@astrojs/cloudflare/handler';
import { Agent, routeAgentRequest } from 'agents';
import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from 'cloudflare:workers';
import {
  ApprovalRequiredError,
  advanceAgentWorkflow,
  assertWorkflowMayExecute,
  createInitialAgentState,
  executeApprovedSideEffect,
  persistAgentAuditEntries,
  recordInferenceAudit,
  requestSideEffectTool,
  type EditorialAgentState,
  type EditorialPublishParams,
  type SideEffectTool,
} from './workflows.ts';
import { generateEditorialDraft } from './inference.ts';
import { retrieveKnowledge } from '../knowledge/retrieval.ts';
import { EditorialRepository } from '../editorial/repository.ts';
import { executeApprovedChannelDelivery } from '../integrations/delivery.ts';
import {
  UnauthorizedError,
  resolveAccessIdentity,
} from '../editorial/validation.ts';

export {
  ApprovalRequiredError,
  advanceAgentWorkflow,
  assertWorkflowMayExecute,
  createInitialAgentState,
  executeApprovedSideEffect,
  persistAgentAuditEntries,
  recordInferenceAudit,
  requestSideEffectTool,
} from './workflows.ts';
export { generateEditorialDraft } from './inference.ts';

export type EditorialAgentPersistedState = {
  sessionId: string;
  step: EditorialAgentState['step'];
  brief: string;
  actorEmail: string;
  promptVersion: string;
  model: string;
  draftMarkdown: string;
  approvalState: EditorialAgentState['approvalState'];
  pendingTool: SideEffectTool | null;
  citationIds: string[];
};

const EMPTY_AGENT_STATE: EditorialAgentPersistedState = {
  sessionId: '',
  step: 'brief',
  brief: '',
  actorEmail: '',
  promptVersion: 'editorial-v1',
  model: '@cf/meta/llama-3.1-8b-instruct',
  draftMarkdown: '',
  approvalState: 'draft',
  pendingTool: null,
  citationIds: [],
};

function toPersistedState(state: EditorialAgentState): EditorialAgentPersistedState {
  return {
    sessionId: state.sessionId,
    step: state.step,
    brief: state.brief,
    actorEmail: state.actorEmail,
    promptVersion: state.promptVersion,
    model: state.model,
    draftMarkdown: state.draftMarkdown,
    approvalState: state.approvalState,
    pendingTool: null,
    citationIds: state.citations.map((citation) => citation.id),
  };
}

function assertArturoIdentity(actorEmail: string, expected: string): void {
  if (actorEmail.trim().toLowerCase() !== expected.trim().toLowerCase()) {
    throw new ApprovalRequiredError(
      'La herramienta requiere la identidad de Arturo',
    );
  }
}

export class EditorialPublishWorkflow extends WorkflowEntrypoint<
  Cloudflare.Env,
  EditorialPublishParams
> {
  async run(
    event: WorkflowEvent<EditorialPublishParams>,
    step: WorkflowStep,
  ): Promise<{
    publicationRequestId: string;
    executed: boolean;
    status?: string;
    providerId?: string | null;
  }> {
    await step.do('verify-approval', async () => {
      assertWorkflowMayExecute(event.payload.approvalState);
      return true;
    });

    const delivery = await step.do('execute-channel-delivery', async () => {
      const repository = new EditorialRepository(this.env.EDITORIAL_DB);
      let publicationRequest = await repository.getPublicationRequestById(
        event.payload.publicationRequestId,
      );
      if (
        event.payload.approvalState === 'approved' &&
        publicationRequest.approvalState === 'needs_approval'
      ) {
        publicationRequest = await repository.updatePublicationApproval(
          publicationRequest.id,
          'approved',
          event.payload.actorEmail,
        );
      }
      const content = await repository.getContentItemById(
        event.payload.contentItemId,
      );
      return executeApprovedChannelDelivery({
        repository,
        env: this.env,
        publicationRequest,
        content,
        actorEmail: event.payload.actorEmail,
        allowSandboxWithoutCredentials: true,
      });
    });

    await step.do('audit-workflow', async () => {
      const repository = new EditorialRepository(this.env.EDITORIAL_DB);
      await repository.recordAuditEvent({
        entityType: 'publication_request',
        entityId: event.payload.publicationRequestId,
        action: 'workflow_executed',
        actorId: event.payload.actorEmail,
        payload: {
          channel: event.payload.channel,
          status: delivery.status,
          providerId: delivery.providerId,
          promptVersion: event.payload.promptVersion,
          model: event.payload.model,
        },
      });
      return true;
    });

    return {
      publicationRequestId: event.payload.publicationRequestId,
      executed: true,
      status: delivery.status,
      providerId: delivery.providerId,
    };
  }
}

/**
 * Cloudflare Agents SDK agent: durable state + typed side-effect tools
 * that require dynamic human approval before external effects.
 */
export class EditorialAgent extends Agent<
  Cloudflare.Env,
  EditorialAgentPersistedState
> {
  /** Runtime env from Agents SDK / Durable Object — declared for strict local tsc. */
  declare env: Cloudflare.Env;

  override initialState: EditorialAgentPersistedState = { ...EMPTY_AGENT_STATE };

  /**
   * Non-side-effect draft path: brief → research plan → retrieval → …
   * Durable Agent state is updated via setState; audit rows go to D1.
   */
  async runBrief(input: {
    brief: string;
    actorEmail: string;
    sessionId?: string;
    /** Defaults false — confidential knowledge stays on Workers AI + gateway. */
    allowExternalModel?: boolean;
  }): Promise<{
    ok: true;
    sessionId: string;
    step: EditorialAgentState['step'];
    approvalState: EditorialAgentState['approvalState'];
    draftMarkdown: string;
    citations: EditorialAgentState['citations'];
    auditPersisted: number;
    routedViaGateway: boolean;
    inferenceDegraded: boolean;
  }> {
    let state = createInitialAgentState({
      brief: input.brief,
      actorEmail: input.actorEmail,
      sessionId: input.sessionId || this.name || undefined,
    });

    const allowExternalModel = input.allowExternalModel === true;
    const repository = new EditorialRepository(this.env.EDITORIAL_DB);
    const retrieval = await retrieveKnowledge({
      repository,
      vectorize: this.env.KNOWLEDGE_INDEX,
      query: {
        text: input.brief,
        actorSensitivity: 'internal',
        allowExternalModel,
      },
    });

    // brief → research_plan → retrieval (approved catalog) → fact_matrix
    state = advanceAgentWorkflow(state);
    state = advanceAgentWorkflow(state);
    state = advanceAgentWorkflow(state, retrieval);

    const documentSensitivities = retrieval.documents.map(
      (document) => document.sensitivity,
    );
    const inference = await generateEditorialDraft({
      ai: this.env.AI,
      gatewayId: this.env.AI_GATEWAY_ID,
      model: state.model,
      promptVersion: state.promptVersion,
      brief: state.brief,
      citations: state.citations,
      allowExternalModel,
      documentSensitivities,
    });
    state = recordInferenceAudit(state, {
      routedViaGateway: inference.routedViaGateway,
      degraded: inference.degraded,
      reason: inference.reason,
      prompt: inference.prompt,
      model: state.model,
      promptVersion: state.promptVersion,
    });

    // fact_matrix → draft (AI/gateway text) → citation_tone_check
    state = advanceAgentWorkflow(state, undefined, inference.draftMarkdown);
    state = advanceAgentWorkflow(state);

    this.setState({
      ...toPersistedState(state),
      pendingTool: null,
    });

    const auditPersisted = await persistAgentAuditEntries({
      repository,
      state,
    });

    return {
      ok: true,
      sessionId: state.sessionId,
      step: state.step,
      approvalState: state.approvalState,
      draftMarkdown: state.draftMarkdown,
      citations: state.citations,
      auditPersisted,
      routedViaGateway: inference.routedViaGateway,
      inferenceDegraded: inference.degraded,
    };
  }

  /**
   * Side-effect tool request — always lands in needs_approval until approveTool.
   */
  async requestTool(input: {
    actorEmail: string;
    tool: SideEffectTool;
  }): Promise<{
    ok: true;
    approvalState: 'needs_approval';
    pendingTool: SideEffectTool;
    auditPersisted: number;
  }> {
    const current = this.state;
    if (!current.actorEmail || !current.brief) {
      throw new ApprovalRequiredError(
        'Ejecuta runBrief antes de solicitar una herramienta',
      );
    }
    assertArturoIdentity(input.actorEmail, current.actorEmail);

    let state = createInitialAgentState({
      brief: current.brief,
      actorEmail: current.actorEmail,
      sessionId: current.sessionId,
      promptVersion: current.promptVersion,
      model: current.model,
    });
    state = {
      ...state,
      step: current.step,
      draftMarkdown: current.draftMarkdown,
      approvalState: current.approvalState,
      citations: [],
      audit: [
        {
          action: 'session_resume',
          promptVersion: current.promptVersion,
          model: current.model,
          actorEmail: current.actorEmail,
        },
      ],
    };
    state = requestSideEffectTool({
      state,
      tool: input.tool,
      actorEmail: input.actorEmail,
    });

    this.setState({
      ...toPersistedState(state),
      pendingTool: input.tool,
      draftMarkdown: current.draftMarkdown || state.draftMarkdown,
      step: current.step,
    });

    const repository = new EditorialRepository(this.env.EDITORIAL_DB);
    const auditPersisted = await persistAgentAuditEntries({
      repository,
      state,
    });

    return {
      ok: true,
      approvalState: 'needs_approval',
      pendingTool: input.tool,
      auditPersisted,
    };
  }

  /**
   * Dynamic approval tied to Arturo identity — executes only after approve.
   */
  async approveTool(input: {
    actorEmail: string;
    tool: SideEffectTool;
  }): Promise<{
    ok: true;
    approvalState: 'executed';
    tool: SideEffectTool;
    auditPersisted: number;
  }> {
    const current = this.state;
    if (!current.actorEmail) {
      throw new ApprovalRequiredError('Sesión de agente ausente');
    }
    assertArturoIdentity(input.actorEmail, current.actorEmail);
    if (current.pendingTool !== input.tool) {
      throw new ApprovalRequiredError(
        'La herramienta pendiente no coincide con la aprobación',
      );
    }
    if (current.approvalState !== 'needs_approval') {
      throw new ApprovalRequiredError(
        `No hay herramienta en needs_approval (estado=${current.approvalState})`,
      );
    }

    let state = createInitialAgentState({
      brief: current.brief,
      actorEmail: current.actorEmail,
      sessionId: current.sessionId,
      promptVersion: current.promptVersion,
      model: current.model,
    });
    state = {
      ...state,
      step: current.step,
      draftMarkdown: current.draftMarkdown,
      approvalState: 'approved',
      citations: [],
      audit: [
        {
          action: 'approval_granted',
          tool: input.tool,
          promptVersion: current.promptVersion,
          model: current.model,
          actorEmail: input.actorEmail,
        },
      ],
    };
    state = executeApprovedSideEffect({ state, tool: input.tool });

    this.setState({
      ...toPersistedState(state),
      pendingTool: null,
    });

    const repository = new EditorialRepository(this.env.EDITORIAL_DB);
    const auditPersisted = await persistAgentAuditEntries({
      repository,
      state,
    });

    return {
      ok: true,
      approvalState: 'executed',
      tool: input.tool,
      auditPersisted,
    };
  }

  /** HTTP fallback for local/preview without WebSocket client. */
  override async onRequest(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      resolveAccessIdentity(request, {
        ACCESS_ALLOWED_EMAILS: this.env.ACCESS_ALLOWED_EMAILS,
        EDITORIAL_DEV_ACTOR_EMAIL: this.env.EDITORIAL_DEV_ACTOR_EMAIL,
      });
    } catch (error) {
      const message =
        error instanceof UnauthorizedError ? error.message : 'unauthorized';
      return Response.json({ ok: false, error: 'unauthorized', message }, {
        status: 401,
      });
    }

    const body = (await request.json()) as {
      action?: 'runBrief' | 'requestTool' | 'approveTool';
      brief?: string;
      actorEmail?: string;
      tool?: SideEffectTool;
      sessionId?: string;
    };

    try {
      if (body.action === 'requestTool' && body.actorEmail && body.tool) {
        return Response.json(
          await this.requestTool({
            actorEmail: body.actorEmail,
            tool: body.tool,
          }),
        );
      }
      if (body.action === 'approveTool' && body.actorEmail && body.tool) {
        return Response.json(
          await this.approveTool({
            actorEmail: body.actorEmail,
            tool: body.tool,
          }),
        );
      }
      if (!body.brief || !body.actorEmail) {
        return Response.json(
          { ok: false, error: 'validation' },
          { status: 422 },
        );
      }
      return Response.json(
        await this.runBrief({
          brief: body.brief,
          actorEmail: body.actorEmail,
          sessionId: body.sessionId,
        }),
      );
    } catch (error) {
      if (error instanceof ApprovalRequiredError) {
        return Response.json(
          {
            ok: false,
            error: 'needs_approval',
            message: error.message,
            approvalState: 'needs_approval',
          },
          { status: 409 },
        );
      }
      return Response.json(
        { ok: false, error: 'validation', message: 'Agent request failed' },
        { status: 422 },
      );
    }
  }
}

export default {
  async fetch(
    request: Request,
    env: Cloudflare.Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/agents/')) {
      try {
        resolveAccessIdentity(request, {
          ACCESS_ALLOWED_EMAILS: env.ACCESS_ALLOWED_EMAILS,
          EDITORIAL_DEV_ACTOR_EMAIL: env.EDITORIAL_DEV_ACTOR_EMAIL,
        });
      } catch {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const agentResponse = await routeAgentRequest(request, env);
    if (agentResponse) {
      return agentResponse;
    }

    return handle(request, env, ctx);
  },
} satisfies ExportedHandler<Cloudflare.Env>;
