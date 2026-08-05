import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
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

  it('verifies current signed Svix webhook payloads only', async () => {
    const secret = 'whsec_c2FuZGJveC1zZWNyZXQ=';
    const rawBody = '{"type":"broadcast.sent"}';
    const svixId = 'msg_test_123';
    const now = new Date('2026-08-04T21:20:00.000Z');
    const svixTimestamp = String(Math.floor(now.getTime() / 1000));
    const key = await webcrypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('sandbox-secret'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signatureBytes = await webcrypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(`${svixId}.${svixTimestamp}.${rawBody}`),
    );
    const signature = Buffer.from(signatureBytes).toString('base64');

    assert.equal(
      await verifyResendWebhookSignature({
        rawBody,
        svixId,
        svixTimestamp,
        svixSignature: `v1,${signature}`,
        secret,
        now,
      }),
      true,
    );
    assert.equal(
      await verifyResendWebhookSignature({
        rawBody,
        svixId,
        svixTimestamp,
        svixSignature: 'v1,invalid',
        secret,
        now,
      }),
      false,
    );
  });
});
