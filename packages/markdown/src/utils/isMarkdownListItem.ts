export function isMarkdownListItem(line: string) {
  return /^\s*(?:[-*+] |\d+[.)] )/.test(line);
}
