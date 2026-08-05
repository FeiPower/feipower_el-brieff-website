import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertExternalModelPolicy,
  generateEditorialDraft,
  isWorkersAiModel,
} from '../../src/lib/agents/inference.ts';

describe('editorial AI Gateway inference', () => {
  it('routes Workers AI calls through gateway.id and returns model text', async () => {
    const calls: Array<{
      model: string;
      options?: { gateway?: { id: string } };
    }> = [];

    const result = await generateEditorialDraft({
      ai: {
        async run(model, _inputs, options) {
          calls.push({ model, options });
          return { response: '# Columna\n\nTexto generado con citas.' };
        },
      },
      gatewayId: 'default',
      model: '@cf/meta/llama-3.1-8b-instruct',
      promptVersion: 'editorial-v1',
      brief: 'Nearshoring en México',
      citations: [
        {
          id: 'c1',
          contentItemId: 'research',
          sourceId: 's1',
          claim: 'La IED creció',
          excerpt: 'Extracto',
          sourceUrl: 'https://example.com/ied',
          publishedAt: null,
          verifiedAt: '2026-08-01T00:00:00.000Z',
        },
      ],
      allowExternalModel: false,
      documentSensitivities: ['public'],
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.options?.gateway?.id, 'default');
    assert.equal(result.routedViaGateway, true);
    assert.equal(result.degraded, false);
    assert.match(result.draftMarkdown, /Texto generado/);
    assert.match(result.prompt, /editorial-v1/);
    assert.match(result.prompt, /https:\/\/example.com\/ied/);
  });

  it('blocks external models when confidential context is present', async () => {
    assert.equal(isWorkersAiModel('@cf/meta/llama-3.1-8b-instruct'), true);
    assert.throws(
      () =>
        assertExternalModelPolicy({
          model: 'openai/gpt-test',
          allowExternalModel: true,
          documentSensitivities: ['confidential'],
        }),
      /external_model_blocked/,
    );

    const result = await generateEditorialDraft({
      ai: {
        async run() {
          throw new Error('should not be called');
        },
      },
      gatewayId: 'default',
      model: 'openai/gpt-test',
      promptVersion: 'editorial-v1',
      brief: 'Brief confidencial',
      citations: [],
      allowExternalModel: true,
      documentSensitivities: ['confidential'],
    });

    assert.equal(result.routedViaGateway, false);
    assert.equal(result.degraded, true);
    assert.equal(result.reason, 'external_model_blocked');
    assert.match(result.draftMarkdown, /Brief confidencial/);
  });

  it('falls back and retains draft state when the provider fails', async () => {
    const result = await generateEditorialDraft({
      ai: {
        async run() {
          throw new Error('gateway timeout');
        },
      },
      gatewayId: 'default',
      model: '@cf/meta/llama-3.1-8b-instruct',
      promptVersion: 'editorial-v1',
      brief: 'Retener borrador',
      citations: [],
      allowExternalModel: false,
      documentSensitivities: [],
    });

    assert.equal(result.degraded, true);
    assert.equal(result.reason, 'provider_failed');
    assert.match(result.draftMarkdown, /Retener borrador/);
  });
});
