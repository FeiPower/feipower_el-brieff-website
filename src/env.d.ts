/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

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

type CloudflareEnv = {
  EMAIL: MediaKitEmailBinding;
  RATE_LIMIT: KvNamespaceLike;
  ASSETS?: { fetch: typeof fetch };
};

declare namespace Cloudflare {
  interface Env extends CloudflareEnv {}
}

declare module 'cloudflare:workers' {
  export const env: CloudflareEnv;
}
