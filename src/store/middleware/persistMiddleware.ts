/**
 * persistMiddleware
 *
 * Historically this module provided localStorage persistence for `favourites`.
 * Favourites are now represented via URL query parameters (bookmarks) and
 * therefore must not be persisted in-app or to localStorage. The functions
 * below are kept as no-op shims for compatibility with older tests/tools.
 */

export function saveFavourites(_favs: unknown[]) {
  // no-op: favourites are now browser-managed via URL
}

export function loadFavourites(): unknown[] {
  // no-op: no persisted favourites in localStorage
  return [];
}
