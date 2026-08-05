import { trackEvent } from './gtag.ts';

export type ArticleReadOptions = {
  articleSlug: string;
};

const SCROLL_THRESHOLD = 0.75;
const ENGAGEMENT_MS = 30_000;

export function initArticleRead(options: ArticleReadOptions): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const articleSlug = options.articleSlug?.trim();
  if (!articleSlug) return;

  let fired = false;

  const fire = (): void => {
    if (fired) return;
    fired = true;
    window.removeEventListener('scroll', onScroll);
    window.clearTimeout(timer);
    trackEvent('article_read', {
      article_slug: articleSlug,
      content_type: 'opinion',
    });
  };

  const onScroll = (): void => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) {
      fire();
      return;
    }
    const depth = window.scrollY / scrollable;
    if (depth >= SCROLL_THRESHOLD) fire();
  };

  const timer = window.setTimeout(fire, ENGAGEMENT_MS);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
