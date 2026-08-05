export type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined
>;

export type AnalyticsEventName =
  | 'listen_cta'
  | 'platform_outbound'
  | 'listen_zone_view'
  | 'media_kit_form_start'
  | 'media_kit_submit'
  | 'media_kit_submit_error'
  | 'media_kit_download'
  | 'social_outbound'
  | 'article_read';

export type CtaLocation =
  | 'hero'
  | 'nav'
  | 'listen_zone'
  | 'platform_links'
  | 'footer'
  | 'about'
  | 'media_kit'
  | 'opinion';

export type CtaId =
  | 'escuchar_ahora'
  | 'abrir_spotify'
  | 'abrir_spotify_fallback'
  | 'nav_escuchar';

export type PlatformId = 'spotify' | 'apple' | 'deezer' | 'iheart' | 'radionet';

export type ReasonBucket = 'prensa' | 'partnership' | 'otro' | 'empty';

export type MediaKitErrorCode =
  | 'validation'
  | 'honeypot'
  | 'rate_limit'
  | 'email_failed'
  | 'disabled'
  | 'network';

export function trackEvent(
  name: AnalyticsEventName | string,
  params?: AnalyticsParams,
): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
