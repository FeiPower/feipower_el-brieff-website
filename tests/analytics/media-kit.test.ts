import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import {
  toErrorCode,
  toReasonBucket,
  trackMediaKitDownload,
  trackMediaKitFormStart,
  trackMediaKitSubmit,
  trackMediaKitSubmitError,
} from '../../src/lib/analytics/media-kit.ts';

const originalWindow = globalThis.window;

afterEach(() => {
  if (originalWindow === undefined) {
    // @ts-expect-error restore missing window in node
    delete globalThis.window;
  } else {
    globalThis.window = originalWindow;
  }
});

describe('media-kit mappers', () => {
  it('maps empty/missing reason to empty', () => {
    assert.equal(toReasonBucket(''), 'empty');
    assert.equal(toReasonBucket(null), 'empty');
    assert.equal(toReasonBucket(undefined), 'empty');
    assert.equal(toReasonBucket('   '), 'empty');
  });

  it('maps known reasons 1:1', () => {
    assert.equal(toReasonBucket('prensa'), 'prensa');
    assert.equal(toReasonBucket('partnership'), 'partnership');
    assert.equal(toReasonBucket('otro'), 'otro');
  });

  it('maps known error codes and unknown to network', () => {
    assert.equal(toErrorCode('validation'), 'validation');
    assert.equal(toErrorCode('honeypot'), 'honeypot');
    assert.equal(toErrorCode('rate_limit'), 'rate_limit');
    assert.equal(toErrorCode('email_failed'), 'email_failed');
    assert.equal(toErrorCode('disabled'), 'disabled');
    assert.equal(toErrorCode('network'), 'network');
    assert.equal(toErrorCode('weird'), 'network');
    assert.equal(toErrorCode(null), 'network');
    assert.equal(toErrorCode(undefined), 'network');
  });
});

describe('media-kit track helpers', () => {
  it('emits params without email/name/organization keys', () => {
    const calls: Array<{ name: string; params?: Record<string, unknown> }> =
      [];
    const gtag = (...args: unknown[]) => {
      calls.push({
        name: String(args[1]),
        params: args[2] as Record<string, unknown> | undefined,
      });
    };
    // @ts-expect-error test stub
    globalThis.window = { dataLayer: [], gtag };

    trackMediaKitFormStart();
    trackMediaKitSubmit('prensa');
    trackMediaKitSubmitError('validation');
    trackMediaKitDownload();

    assert.equal(calls.length, 4);
    for (const call of calls) {
      const keys = Object.keys(call.params ?? {});
      assert.equal(keys.includes('email'), false);
      assert.equal(keys.includes('name'), false);
      assert.equal(keys.includes('organization'), false);
    }

    assert.deepEqual(calls[0], {
      name: 'media_kit_form_start',
      params: { form_id: 'media_kit' },
    });
    assert.deepEqual(calls[1], {
      name: 'media_kit_submit',
      params: { form_id: 'media_kit', reason_bucket: 'prensa' },
    });
    assert.deepEqual(calls[2], {
      name: 'media_kit_submit_error',
      params: { form_id: 'media_kit', error_code: 'validation' },
    });
    assert.deepEqual(calls[3], {
      name: 'media_kit_download',
      params: {
        form_id: 'media_kit',
        file_name: 'el-brieff-media-kit.pdf',
      },
    });
  });
});
