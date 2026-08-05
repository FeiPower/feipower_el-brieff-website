import { trackEvent, type AnalyticsParams } from './gtag.ts';

export const LISTEN_ZONE_SESSION_KEY = 'el_brieff_listen_zone_view';

const ANALYTICS_ATTR_PREFIX = 'analytics';

let listenZoneFiredInMemory = false;

function datasetKeyToParam(key: string): string | null {
  // dataset keys are camelCase without the "data-" prefix (e.g. analyticsCtaId)
  if (!key.startsWith(ANALYTICS_ATTR_PREFIX)) return null;
  const rest = key.slice(ANALYTICS_ATTR_PREFIX.length);
  if (!rest) return null;
  // analyticsEvent → Event → event; analyticsCtaId → CtaId → cta_id
  const snake = rest
    .replace(/^[A-Z]/, (ch) => ch.toLowerCase())
    .replace(/[A-Z]/g, (ch) => `_${ch.toLowerCase()}`);
  if (snake === 'event') return null;
  return snake;
}

function paramsFromElement(el: HTMLElement): AnalyticsParams {
  const params: AnalyticsParams = {};
  for (const [key, value] of Object.entries(el.dataset)) {
    const param = datasetKeyToParam(key);
    if (!param || value === undefined || value === '') continue;
    params[param] = value;
  }
  if (el instanceof HTMLAnchorElement) {
    const href = el.getAttribute('href');
    if (href) params.link_url = href;
  }
  return params;
}

function onAnalyticsClick(event: Event): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const el = target.closest('[data-analytics-event]');
  if (!(el instanceof HTMLElement)) return;
  const eventName = el.dataset.analyticsEvent;
  if (!eventName) return;
  trackEvent(eventName, paramsFromElement(el));
}

function hasSessionFlag(): boolean {
  try {
    return sessionStorage.getItem(LISTEN_ZONE_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function setSessionFlag(): void {
  try {
    sessionStorage.setItem(LISTEN_ZONE_SESSION_KEY, '1');
  } catch {
    // ignore quota / private mode failures
  }
}

function observeListenZone(): void {
  if (typeof document === 'undefined') return;
  if (typeof IntersectionObserver === 'undefined') return;

  const zone = document.getElementById('escuchar');
  if (!zone) return;

  if (listenZoneFiredInMemory || hasSessionFlag()) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
        if (listenZoneFiredInMemory || hasSessionFlag()) {
          observer.disconnect();
          return;
        }
        listenZoneFiredInMemory = true;
        setSessionFlag();
        trackEvent('listen_zone_view', { engagement_source: 'intersection' });
        observer.disconnect();
        return;
      }
    },
    { threshold: 0.5 },
  );

  observer.observe(zone);
}

export function initAnalyticsBinder(): void {
  if (typeof document === 'undefined') return;
  document.addEventListener('click', onAnalyticsClick);
  observeListenZone();
}
