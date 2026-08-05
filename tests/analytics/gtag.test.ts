import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { trackEvent } from '../../src/lib/analytics/gtag.ts';

const originalWindow = globalThis.window;

afterEach(() => {
  if (originalWindow === undefined) {
    // @ts-expect-error restore missing window in node
    delete globalThis.window;
  } else {
    globalThis.window = originalWindow;
  }
});

describe('trackEvent', () => {
  it('no-ops without window.gtag and does not throw', () => {
    // @ts-expect-error node has no window by default
    delete globalThis.window;
    assert.doesNotThrow(() => {
      trackEvent('listen_cta', { cta_id: 'escuchar_ahora' });
    });
  });

  it('no-ops when gtag is not a function', () => {
    // @ts-expect-error test stub
    globalThis.window = { dataLayer: [], gtag: undefined };
    assert.doesNotThrow(() => {
      trackEvent('listen_cta');
    });
  });

  it('forwards name and params when gtag mock is present', () => {
    const calls: unknown[][] = [];
    const gtag = (...args: unknown[]) => {
      calls.push(args);
    };
    // @ts-expect-error test stub
    globalThis.window = { dataLayer: [], gtag };

    trackEvent('platform_outbound', {
      platform_id: 'spotify',
      cta_location: 'platform_links',
      link_url: 'https://example.com',
    });

    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], [
      'event',
      'platform_outbound',
      {
        platform_id: 'spotify',
        cta_location: 'platform_links',
        link_url: 'https://example.com',
      },
    ]);
  });
});
