import {
  ValidationError,
  parseContentKind,
  parseEditorialStatus,
  type Citation,
  type ContentItem,
  type ContentKind,
  type EditorialStatus,
} from './contracts.ts';

export class ForbiddenError extends Error {
  readonly code = 'forbidden' as const;

  constructor(message = 'Prohibido') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictStateError extends Error {
  readonly code = 'conflict' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictStateError';
  }
}

export const ALLOWED_TRANSITIONS: Record<EditorialStatus, EditorialStatus[]> = {
  idea: ['research', 'draft'],
  research: ['draft', 'idea'],
  draft: ['editing', 'research', 'idea'],
  editing: ['approved', 'draft'],
  approved: ['scheduled', 'published', 'editing'],
  scheduled: ['published', 'approved'],
  published: ['syndicated'],
  syndicated: [],
};

export type PublishPrerequisites = {
  category: string | null;
  disclosure: string | null;
  featuredAssetId: string | null;
  citations: Citation[];
};

export function assertEditorialTransition(
  from: EditorialStatus,
  to: EditorialStatus,
): void {
  if (from === to) {
    return;
  }
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new ConflictStateError(
      `Transición ilegal de ${from} a ${to}`,
    );
  }
}

export function canCreatePublicationRequest(
  from: EditorialStatus,
  to: EditorialStatus,
): boolean {
  return from === 'approved' && (to === 'scheduled' || to === 'published');
}

export function assertPublishPrerequisites(
  content: ContentItem,
  prerequisites: PublishPrerequisites,
): void {
  const missing: string[] = [];
  if (!content.title.trim()) missing.push('title');
  if (!content.slug.trim()) missing.push('slug');
  if (!content.summary.trim()) missing.push('summary');
  if (!content.bodyMarkdown.trim()) missing.push('body');
  if (!content.authorId.trim()) missing.push('author');
  if (!prerequisites.featuredAssetId?.trim()) missing.push('featured_asset');
  if (!prerequisites.category?.trim()) missing.push('category');
  if (!prerequisites.disclosure?.trim()) missing.push('disclosure');
  if (prerequisites.citations.length < 1) missing.push('citation');

  if (missing.length > 0) {
    throw new ConflictStateError(
      `Publicación incompleta: faltan ${missing.join(', ')}`,
    );
  }
}

export class UnauthorizedError extends Error {
  readonly code = 'unauthorized' as const;

  constructor(message = 'Acceso no autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export type AccessEnv = {
  ACCESS_ALLOWED_EMAILS?: string;
  EDITORIAL_DEV_ACTOR_EMAIL?: string;
};

export type AccessIdentity = {
  email: string;
  source: 'cloudflare-access' | 'local-dev-mock';
};

export type DraftCitationInput = {
  claim: string;
  excerpt: string;
  sourceUrl: string;
};

export type DraftArticleInput = {
  kind: ContentKind;
  title: string;
  summary: string;
  slug: string;
  bodyMarkdown: string;
  status: EditorialStatus;
  citations: DraftCitationInput[];
};

export type FieldErrors = Partial<
  Record<
    | 'kind'
    | 'title'
    | 'summary'
    | 'slug'
    | 'bodyMarkdown'
    | 'status'
    | 'citations'
    | 'form',
    string
  >
>;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_RE = /^https?:\/\/\S+$/i;

function parseAllowlist(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);
}

/**
 * Trust Access identity headers only after allowlist verification.
 * Local mock is enabled solely when import.meta.env.DEV and a non-production
 * EDITORIAL_DEV_ACTOR_EMAIL var is present (Failure Mode for Task 3).
 */
export function resolveAccessIdentity(
  request: Request,
  env: AccessEnv,
): AccessIdentity {
  const allowlist = parseAllowlist(env.ACCESS_ALLOWED_EMAILS);
  const accessEmail = request.headers
    .get('Cf-Access-Authenticated-User-Email')
    ?.trim()
    .toLowerCase();

  if (accessEmail) {
    if (allowlist.length === 0 || !allowlist.includes(accessEmail)) {
      throw new UnauthorizedError(
        'La identidad de Access no está en la lista permitida',
      );
    }
    return { email: accessEmail, source: 'cloudflare-access' };
  }

  const devEmail = env.EDITORIAL_DEV_ACTOR_EMAIL?.trim().toLowerCase();
  const isDev = Boolean(
    typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.DEV,
  );
  if (isDev && devEmail) {
    if (allowlist.length > 0 && !allowlist.includes(devEmail)) {
      throw new UnauthorizedError(
        'El actor de desarrollo no está en la lista permitida',
      );
    }
    return { email: devEmail, source: 'local-dev-mock' };
  }

  throw new UnauthorizedError(
    'Se requiere autenticación de Cloudflare Access',
  );
}

function readString(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export function validateDraftArticleForm(form: FormData): {
  ok: true;
  value: DraftArticleInput;
} | {
  ok: false;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};

  let kind: ContentKind | null = null;
  let status: EditorialStatus | null = null;

  try {
    kind = parseContentKind(readString(form, 'kind'));
  } catch {
    errors.kind = 'Selecciona un tipo de contenido válido.';
  }

  try {
    status = parseEditorialStatus(readString(form, 'status'));
  } catch {
    errors.status = 'Selecciona un estado editorial válido.';
  }

  const title = readString(form, 'title');
  if (title.length < 3) {
    errors.title = 'El título debe tener al menos 3 caracteres.';
  }

  const summary = readString(form, 'summary');
  if (summary.length < 10) {
    errors.summary = 'El resumen debe tener al menos 10 caracteres.';
  }

  const slug = readString(form, 'slug').toLowerCase();
  if (!SLUG_RE.test(slug)) {
    errors.slug =
      'El slug solo puede usar minúsculas, números y guiones (ej. mi-columna).';
  }

  const bodyMarkdown = readString(form, 'bodyMarkdown');
  if (bodyMarkdown.length < 20) {
    errors.bodyMarkdown = 'El cuerpo debe tener al menos 20 caracteres.';
  }

  const claim = readString(form, 'citationClaim');
  const excerpt = readString(form, 'citationExcerpt');
  const sourceUrl = readString(form, 'citationSourceUrl');
  const citations: DraftCitationInput[] = [];

  if (claim || excerpt || sourceUrl) {
    if (claim.length < 5) {
      errors.citations = 'La afirmación de la cita es demasiado corta.';
    } else if (excerpt.length < 5) {
      errors.citations = 'El extracto de la cita es demasiado corto.';
    } else if (!URL_RE.test(sourceUrl)) {
      errors.citations = 'La URL de la fuente debe comenzar con http(s)://.';
    } else {
      citations.push({ claim, excerpt, sourceUrl });
    }
  }

  if (Object.keys(errors).length > 0 || !kind || !status) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      kind,
      title,
      summary,
      slug,
      bodyMarkdown,
      status,
      citations,
    },
  };
}

export type SyndicationRuleInput =
  | 'exclude'
  | 'excerpt'
  | 'full_after_delay'
  | 'full';

export function parseSyndicationRule(value: unknown): SyndicationRuleInput {
  if (
    value === 'exclude' ||
    value === 'excerpt' ||
    value === 'full_after_delay' ||
    value === 'full'
  ) {
    return value;
  }
  throw new ValidationError('Regla de sindicación inválida');
}

export function assertNeverUnknown(value: never): never {
  throw new ValidationError(`Valor no soportado: ${String(value)}`);
}
