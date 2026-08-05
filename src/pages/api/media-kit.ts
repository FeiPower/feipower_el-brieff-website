import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { site } from '../../config/site';

export const prerender = false;

type MediaKitRequest = {
  name: string;
  email: string;
  organization?: string;
  reason?: string;
  website?: string;
};

type MediaKitSuccess = {
  ok: true;
  downloadUrl: '/media-kit/el-brieff-media-kit.pdf';
};

type MediaKitError = {
  ok: false;
  error: 'validation' | 'honeypot' | 'rate_limit' | 'email_failed' | 'disabled';
};

type MediaKitEnv = {
  EMAIL: {
    send: (msg: {
      from: string;
      to: string | string[];
      cc?: string | string[];
      subject: string;
      text?: string;
      html?: string;
    }) => Promise<{ messageId: string }>;
  };
  RATE_LIMIT: {
    get: (key: string) => Promise<string | null>;
    put: (
      key: string,
      value: string,
      options?: { expirationTtl?: number },
    ) => Promise<void>;
  };
};

const DOWNLOAD_URL = '/media-kit/el-brieff-media-kit.pdf' as const;
const RATE_WINDOW_SECONDS = 10 * 60;
const RATE_MAX = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(
  body: MediaKitSuccess | MediaKitError,
  status: number,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function hashValue(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

async function isRateLimited(
  kv: MediaKitEnv['RATE_LIMIT'],
  keys: string[],
): Promise<boolean> {
  for (const key of keys) {
    const raw = await kv.get(key);
    const count = raw ? Number.parseInt(raw, 10) : 0;
    if (Number.isFinite(count) && count >= RATE_MAX) {
      return true;
    }
  }
  return false;
}

async function incrementRateLimit(
  kv: MediaKitEnv['RATE_LIMIT'],
  keys: string[],
): Promise<void> {
  for (const key of keys) {
    const raw = await kv.get(key);
    const count = raw ? Number.parseInt(raw, 10) : 0;
    const next = (Number.isFinite(count) ? count : 0) + 1;
    await kv.put(key, String(next), { expirationTtl: RATE_WINDOW_SECONDS });
  }
}

function parseBody(data: unknown): MediaKitRequest | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const record = data as Record<string, unknown>;
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  const email = typeof record.email === 'string' ? record.email.trim() : '';
  const organization =
    typeof record.organization === 'string'
      ? record.organization.trim()
      : undefined;
  const reason =
    typeof record.reason === 'string' ? record.reason.trim() : undefined;
  const website =
    typeof record.website === 'string' ? record.website : undefined;

  return { name, email, organization, reason, website };
}

export const POST: APIRoute = async ({ request }) => {
  const mediaEnv = env as unknown as MediaKitEnv;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'validation' }, 400);
  }

  const body = parseBody(payload);
  if (!body) {
    return jsonResponse({ ok: false, error: 'validation' }, 400);
  }

  if (body.website && body.website.trim().length > 0) {
    return jsonResponse({ ok: false, error: 'honeypot' }, 400);
  }

  if (!site.features.mediaKitEmailEnabled) {
    return jsonResponse({ ok: false, error: 'disabled' }, 403);
  }

  if (
    body.name.length < 2 ||
    body.name.length > 120 ||
    !EMAIL_RE.test(body.email) ||
    body.email.length > 200
  ) {
    return jsonResponse({ ok: false, error: 'validation' }, 400);
  }

  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  const ipHash = await hashValue(ip);
  const emailLower = body.email.toLowerCase();
  const rateKeys = [`mk:${ipHash}`, `mk:${emailLower}`];

  if (await isRateLimited(mediaEnv.RATE_LIMIT, rateKeys)) {
    return jsonResponse({ ok: false, error: 'rate_limit' }, 429);
  }

  const subject = `[El Brieff media kit] ${body.name}`;
  const textLines = [
    `Nombre: ${body.name}`,
    `Email: ${body.email}`,
    `Organización: ${body.organization || '(sin dato)'}`,
    `Motivo: ${body.reason || '(sin dato)'}`,
    '',
    `PDF: ${site.siteUrl}${DOWNLOAD_URL}`,
  ];

  try {
    await mediaEnv.EMAIL.send({
      from: site.press.from,
      to: site.press.to,
      cc: site.press.cc,
      subject,
      text: textLines.join('\n'),
    });
  } catch {
    return jsonResponse({ ok: false, error: 'email_failed' }, 502);
  }

  await incrementRateLimit(mediaEnv.RATE_LIMIT, rateKeys);

  return jsonResponse({ ok: true, downloadUrl: DOWNLOAD_URL }, 200);
};
