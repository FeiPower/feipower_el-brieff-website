/** Responsive about-host portrait — variants from `npm run optimize:about`. */
export const ABOUT_IMAGE = {
  alt: 'Arturo Salazar Bazúa',
  width: 819,
  height: 1024,
  /** Fallback for browsers without AVIF/WebP picture sources. */
  src: '/arturo-about-us.png',
  /** Portrait column maxes at 16rem; 100vw on narrow stacks. */
  sizes: '(min-width: 800px) 16rem, 100vw',
  avifSrcSet: [
    '/about/arturo-about-us-320.avif 320w',
    '/about/arturo-about-us-480.avif 480w',
    '/about/arturo-about-us-640.avif 640w',
  ].join(', '),
  webpSrcSet: [
    '/about/arturo-about-us-320.webp 320w',
    '/about/arturo-about-us-480.webp 480w',
    '/about/arturo-about-us-640.webp 640w',
  ].join(', '),
} as const;
