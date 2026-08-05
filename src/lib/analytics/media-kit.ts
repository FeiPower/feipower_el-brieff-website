import {
  trackEvent,
  type MediaKitErrorCode,
  type ReasonBucket,
} from './gtag.ts';

const REASON_BUCKETS = new Set<ReasonBucket>([
  'prensa',
  'partnership',
  'otro',
  'empty',
]);

const ERROR_CODES = new Set<MediaKitErrorCode>([
  'validation',
  'honeypot',
  'rate_limit',
  'email_failed',
  'disabled',
  'network',
]);

export function toReasonBucket(
  reason: string | undefined | null,
): ReasonBucket {
  if (reason == null || reason.trim() === '') return 'empty';
  const normalized = reason.trim() as ReasonBucket;
  if (REASON_BUCKETS.has(normalized) && normalized !== 'empty') {
    return normalized;
  }
  return 'empty';
}

export function toErrorCode(
  apiError: string | undefined | null,
): MediaKitErrorCode {
  if (apiError == null || apiError.trim() === '') return 'network';
  const normalized = apiError.trim() as MediaKitErrorCode;
  if (ERROR_CODES.has(normalized)) return normalized;
  return 'network';
}

export function trackMediaKitFormStart(): void {
  trackEvent('media_kit_form_start', { form_id: 'media_kit' });
}

export function trackMediaKitSubmit(
  reason: string | undefined | null,
): void {
  trackEvent('media_kit_submit', {
    form_id: 'media_kit',
    reason_bucket: toReasonBucket(reason),
  });
}

export function trackMediaKitSubmitError(
  apiError: string | undefined | null,
): void {
  trackEvent('media_kit_submit_error', {
    form_id: 'media_kit',
    error_code: toErrorCode(apiError),
  });
}

export function trackMediaKitDownload(): void {
  trackEvent('media_kit_download', {
    form_id: 'media_kit',
    file_name: 'el-brieff-media-kit.pdf',
  });
}
