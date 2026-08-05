import { env } from 'cloudflare:workers';
import { EditorialRepository } from './repository.ts';

type D1DatabaseLike = ConstructorParameters<typeof EditorialRepository>[0];

/**
 * Editorial D1 is optional until remote bindings are provisioned.
 * Marketing deploy (EMAIL + RATE_LIMIT only) must still serve sitemap/robots.
 */
export function getEditorialRepository(): EditorialRepository | null {
  const db = (env as { EDITORIAL_DB?: D1DatabaseLike | null }).EDITORIAL_DB;
  if (!db) {
    return null;
  }
  return new EditorialRepository(db);
}
