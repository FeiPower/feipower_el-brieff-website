/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
}

type KvNamespaceLike = {
  get: (key: string) => Promise<string | null>;
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ) => Promise<void>;
};

type MediaKitEmailBinding = {
  send: (msg: {
    from: string;
    to: string | string[];
    cc?: string | string[];
    subject: string;
    text?: string;
    html?: string;
  }) => Promise<{ messageId: string }>;
};

type D1PreparedStatementLike = {
  bind: (...values: unknown[]) => D1PreparedStatementLike;
  first: <T = unknown>() => Promise<T | null>;
  all: <T = unknown>() => Promise<{ results: T[] }>;
  run: () => Promise<{ success?: boolean; meta?: { changes?: number } }>;
};

type D1DatabaseLike = {
  prepare: (query: string) => D1PreparedStatementLike;
  batch: (statements: D1PreparedStatementLike[]) => Promise<unknown[]>;
};

type R2ObjectBodyLike = {
  text: () => Promise<string>;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

type R2BucketLike = {
  get: (key: string) => Promise<R2ObjectBodyLike | null>;
  put: (
    key: string,
    value: string | ArrayBuffer | ReadableStream,
    options?: { httpMetadata?: { contentType?: string } },
  ) => Promise<unknown>;
  delete: (key: string) => Promise<void>;
};

type VectorizeMatchLike = {
  id: string;
  score: number;
  metadata?: Record<string, string | number | boolean | null>;
};

type VectorizeIndexLike = {
  query: (
    vector: number[],
    options?: { topK?: number; returnMetadata?: boolean },
  ) => Promise<{ matches: VectorizeMatchLike[] }>;
  upsert: (
    vectors: Array<{
      id: string;
      values: number[];
      metadata?: Record<string, string | number | boolean | null>;
    }>,
  ) => Promise<unknown>;
};

type WorkersAiLike = {
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

type QueueProducerLike = {
  send: (message: unknown, options?: { contentType?: string }) => Promise<void>;
  sendBatch: (messages: Array<{ body: unknown }>) => Promise<void>;
};

type WorkflowInstanceLike = {
  id: string;
  status: () => Promise<{ status: string }>;
};

type WorkflowBindingLike = {
  create: (options?: {
    id?: string;
    params?: Record<string, unknown>;
  }) => Promise<WorkflowInstanceLike>;
  get: (id: string) => Promise<WorkflowInstanceLike>;
};

type DurableObjectStubLike = {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

type DurableObjectNamespaceLike = {
  idFromName: (name: string) => { toString: () => string };
  get: (id: { toString: () => string }) => DurableObjectStubLike;
};

type CloudflareEnv = {
  EMAIL: MediaKitEmailBinding;
  RATE_LIMIT: KvNamespaceLike;
  ASSETS?: { fetch: typeof fetch };
  EDITORIAL_DB: D1DatabaseLike;
  EDITORIAL_DOCUMENTS: R2BucketLike;
  KNOWLEDGE_INDEX: VectorizeIndexLike;
  AI: WorkersAiLike;
  AI_GATEWAY_ID: string;
  ACCESS_ALLOWED_EMAILS?: string;
  EDITORIAL_DEV_ACTOR_EMAIL?: string;
  /** Sandbox/non-production secrets — set via `wrangler secret`, never in git. */
  RESEND_API_KEY?: string;
  RESEND_WEBHOOK_SECRET?: string;
  LINKEDIN_ACCESS_TOKEN?: string;
  LINKEDIN_ORGANIZATION_URN?: string;
  EDITORIAL_QUEUE: QueueProducerLike;
  EDITORIAL_WORKFLOW: WorkflowBindingLike;
  EDITORIAL_AGENT: DurableObjectNamespaceLike;
};

declare namespace Cloudflare {
  interface Env extends CloudflareEnv {}
}

/** Minimal Worker runtime globals when @cloudflare/workers-types is not installed. */
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

interface ExportedHandler<Env = unknown> {
  fetch?: (
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ) => Response | Promise<Response>;
}

declare module 'cloudflare:workers' {
  export const env: CloudflareEnv;

  export class WorkflowEntrypoint<
    Env = unknown,
    Params extends Record<string, unknown> = Record<string, unknown>,
  > {
    protected env: Env;
    run(
      event: WorkflowEvent<Params>,
      step: WorkflowStep,
    ): Promise<unknown>;
  }

  export interface WorkflowEvent<Params = Record<string, unknown>> {
    payload: Params;
    timestamp: Date;
    instanceId: string;
  }

  export interface WorkflowStep {
    do<T>(name: string, callback: () => Promise<T>): Promise<T>;
  }
}
