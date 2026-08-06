/** Responsive listen-zone cover — variants from `npm run optimize:cover`. */
export const COVER_IMAGE = {
  /** Decorative in the facade; heading + control name the show. */
  alt: '',
  width: 500,
  height: 500,
  /** Fallback for browsers without AVIF/WebP picture sources. */
  src: '/elbrieff-cover.png',
  /** Idle facade is a 1:1 plane capped at ~352px (see site.spotify.embedFacadeHeight). */
  sizes: '(max-width: 767px) min(100vw, 22rem), 22rem',
  avifSrcSet: [
    '/cover/elbrieff-cover-360.avif 360w',
    '/cover/elbrieff-cover-500.avif 500w',
  ].join(', '),
  webpSrcSet: [
    '/cover/elbrieff-cover-360.webp 360w',
    '/cover/elbrieff-cover-500.webp 500w',
  ].join(', '),
} as const;
