import { isMarkdownListItem } from './isMarkdownListItem';

// remark (the preview renderer) treats 4+ leading spaces as a code block (<pre>).
// 2 leading spaces is the maximum safe indent for a non-list paragraph.
export const MAX_PARAGRAPH_LEADING_SPACES = 2;

export function getLeadingSpaces(line: string): number {
  return line.match(/^ */)?.[0].length ?? 0;
}

export function canIndent(line: string, indentUnit: number): boolean {
  if (isMarkdownListItem(line)) return true;
  return getLeadingSpaces(line) + indentUnit <= MAX_PARAGRAPH_LEADING_SPACES;
}

export function canDedent(line: string): boolean {
  return getLeadingSpaces(line) > 0;
}
