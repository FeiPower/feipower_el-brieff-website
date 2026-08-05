import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ProviderError,
  UNSUBSCRIBE_PLACEHOLDER,
  deliverResendBroadcast,
  verifyResendWebhookSignature,
} from '../../src/lib/integrations/resend.ts';

describe('resend adapter', () => {
  it('requires unsubscribe placeholder and supports test-recipient mode', async () => {
    await assert.rejects(
      () =>
        deliverResendBroadcast({
          client: {
            async createBroadcast() {
              return { id: 'b1' };
            },
            async sendBroadcast() {
              return { id: 'b1' };
            },
          },
          payload: {
            subject: 'Hola',
            html: '<p>sin baja</p>',
            text: 'sin baja',
            segmentId: 'seg',
          },
        }),
      ProviderError,
    );

    let sendCalled = false;
    const result = await deliverResendBroadcast({
      client: {
        async createBroadcast(payload) {
          assert.match(payload.html, new RegExp(UNSUBSCRIBE_PLACEHOLDER));
          return { id: 'broadcast_test' };
        },
        async sendBroadcast() {
          sendCalled = true;
          return { id: 'broadcast_test' };
        },
      },
      payload: {
        subject: 'Prueba',
        html: `<p>Hola</p><a href="${UNSUBSCRIBE_PLACEHOLDER}">baja</a>`,
        text: 'Hola',
        segmentId: 'seg_test',
        testRecipient: 'arturo@strtgy.ai',
      },
    });

    assert.equal(result.status, 'sent');
    assert.equal(result.providerId, 'broadcast_test');
    assert.equal(sendCalled, false);
  });

  it('returns prior delivery for repeated idempotency without re-send', async () => {
    let creates = 0;
    const result = await deliverResendBroadcast({
      client: {
        async createBroadcast() {
          creates += 1;
          return { id: 'new' };
        },
        async sendBroadcast() {
          return { id: 'new' };
        },
      },
      payload: {
        subject: 'Prueba',
        html: `<p>${UNSUBSCRIBE_PLACEHOLDER}</p>`,
        text: 't',
        segmentId: 'seg',
      },
      priorProviderId: 'prior_123',
    });

    assert.equal(result.status, 'duplicate');
    assert.equal(result.providerId, 'prior_123');
    assert.equal(creates, 0);
  });

  it('verifies signed webhook path', () => {
    assert.equal(
      verifyResendWebhookSignature({
        rawBody: '{}',
        signatureHeader: 'abc',
        secret: 'abc',
      }),
      true,
    );
    assert.equal(
      verifyResendWebhookSignature({
        rawBody: '{}',
        signatureHeader: 'abc',
        secret: 'xyz',
      }),
      false,
    );
  });
});
