import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { deliverLinkedInPost } from '../../src/lib/integrations/linkedin.ts';
import { ProviderError } from '../../src/lib/integrations/resend.ts';

describe('linkedin adapter', () => {
  it('publishes only approved URL/card/copy payload to organization', async () => {
    const result = await deliverLinkedInPost({
      client: {
        async createOrganizationPost(payload) {
          assert.equal(
            payload.organizationUrn,
            'urn:li:organization:123',
          );
          assert.match(payload.canonicalUrl, /^https:\/\//);
          return { id: 'li_post_1' };
        },
      },
      payload: {
        organizationUrn: 'urn:li:organization:123',
        commentary: 'Nueva columna en El Brieff',
        canonicalUrl: 'https://el-brieff.strtgy.ai/opinion/demo/',
        title: 'Demo',
      },
    });

    assert.equal(result.status, 'sent');
    assert.equal(result.providerId, 'li_post_1');
  });

  it('rejects invalid organization payloads and replays idempotently', async () => {
    await assert.rejects(
      () =>
        deliverLinkedInPost({
          client: {
            async createOrganizationPost() {
              return { id: 'x' };
            },
          },
          payload: {
            organizationUrn: 'invalid',
            commentary: 'x',
            canonicalUrl: 'https://example.com',
            title: 't',
          },
        }),
      ProviderError,
    );

    const replay = await deliverLinkedInPost({
      client: {
        async createOrganizationPost() {
          throw new Error('should not send');
        },
      },
      payload: {
        organizationUrn: 'urn:li:organization:123',
        commentary: 'x',
        canonicalUrl: 'https://example.com/a',
        title: 't',
      },
      priorProviderId: 'li_existing',
    });
    assert.equal(replay.status, 'duplicate');
  });
});
