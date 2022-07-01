/**
 * Trim leading slash character if found. Bails otherwise.
 *
 * @example
 * trimLeadingSlash("/my query") // --> "my query"
 */
export function trimLeadingSlash(text: string) {
  if (!text.startsWith('/')) {
    return text;
  }

  return text.slice(1);
}
