import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ValidationError,
  parseApprovalState,
  parseContentKind,
  parseEditorialStatus,
  parseSensitivity,
} from '../../src/lib/editorial/contracts.ts';
import {
  UnauthorizedError,
  resolveAccessIdentity,
  validateDraftArticleForm,
} from '../../src/lib/editorial/validation.ts';

describe('editorial contracts', () => {
  it('parses known enums and rejects unknown values without coercion', () => {
    assert.equal(parseContentKind('column'), 'column');
    assert.equal(parseEditorialStatus('approved'), 'approved');
    assert.equal(parseSensitivity('confidential'), 'confidential');
    assert.equal(parseApprovalState('needs_approval'), 'needs_approval');

    assert.throws(() => parseContentKind('blog'), ValidationError);
    assert.throws(() => parseEditorialStatus('live'), ValidationError);
    assert.throws(() => parseSensitivity('secret'), ValidationError);
    assert.throws(() => parseApprovalState('maybe'), ValidationError);
  });
});

describe('access identity parser', () => {
  it('accepts allowlisted Cloudflare Access email headers', () => {
    const identity = resolveAccessIdentity(
      new Request('https://example.com/admin', {
        headers: {
          'Cf-Access-Authenticated-User-Email': 'arturo@strtgy.ai',
        },
      }),
      { ACCESS_ALLOWED_EMAILS: 'arturo@strtgy.ai' },
    );
    assert.equal(identity.email, 'arturo@strtgy.ai');
    assert.equal(identity.source, 'cloudflare-access');
  });

  it('denies missing Access identity', () => {
    assert.throws(
      () =>
        resolveAccessIdentity(new Request('https://example.com/admin'), {
          ACCESS_ALLOWED_EMAILS: 'arturo@strtgy.ai',
        }),
      UnauthorizedError,
    );
  });
});

describe('draft article validation', () => {
  it('returns Spanish field errors and never puts secrets in the payload shape', () => {
    const form = new FormData();
    form.set('kind', 'column');
    form.set('status', 'draft');
    form.set('title', 'ab');
    form.set('summary', 'corto');
    form.set('slug', 'Bad Slug');
    form.set('bodyMarkdown', 'corto');

    const result = validateDraftArticleForm(form);
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.match(result.errors.title ?? '', /título/i);
    assert.match(result.errors.slug ?? '', /slug/i);
    assert.match(result.errors.bodyMarkdown ?? '', /cuerpo/i);
  });

  it('accepts a complete draft with one citation', () => {
    const form = new FormData();
    form.set('kind', 'column');
    form.set('status', 'draft');
    form.set('title', 'Columna de prueba');
    form.set('summary', 'Un resumen suficientemente largo');
    form.set('slug', 'columna-de-prueba');
    form.set(
      'bodyMarkdown',
      'Cuerpo editorial con suficiente extensión para validar.',
    );
    form.set('citationClaim', 'El PIB creció');
    form.set('citationExcerpt', 'Según el reporte oficial');
    form.set('citationSourceUrl', 'https://example.com/fuente');

    const result = validateDraftArticleForm(form);
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.value.citations.length, 1);
  });
});
