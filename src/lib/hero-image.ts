/** Responsive web-hero cut-out — alpha variants from `npm run optimize:hero`. */
export const HERO_IMAGE = {
  alt: 'Arturo Salazar, conductor de El Brieff',
  width: 1024,
  height: 1024,
  /** Fallback for browsers without AVIF/WebP picture sources. */
  src: '/arturo-cover-cut-out.png',
  sizes: '(min-width: 900px) 50vw, 100vw',
  avifSrcSet: [
    '/hero/arturo-cover-cut-out-480.avif 480w',
    '/hero/arturo-cover-cut-out-768.avif 768w',
    '/hero/arturo-cover-cut-out-1024.avif 1024w',
  ].join(', '),
  webpSrcSet: [
    '/hero/arturo-cover-cut-out-480.webp 480w',
    '/hero/arturo-cover-cut-out-768.webp 768w',
    '/hero/arturo-cover-cut-out-1024.webp 1024w',
  ].join(', '),
} as const;
