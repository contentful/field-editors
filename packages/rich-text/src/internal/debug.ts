import type { BasePoint, BaseSelection, PlateEditor } from './types';

type TreeSummary = {
  maxDepth: number;
  nodeTypes: Record<string, number>;
  textLength: number;
  textNodes: number;
  topLevelNodes: number;
  totalNodes: number;
};

type DebugPayload = Record<string, unknown> | (() => Record<string, unknown>);

export function logRichTextDebug(event: string, payload: DebugPayload = {}) {
  const resolvedPayload = typeof payload === 'function' ? payload() : payload;

  // eslint-disable-next-line no-console -- Temporary diagnostics for customer debugging.
  const logger = console.debug ?? console.log;
  logger.call(console, `[field-editor-rich-text] ${event}`, resolvedPayload);
}

export function formatPointForDebug(point?: BasePoint | null) {
  if (!point) {
    return null;
  }

  return {
    offset: point.offset,
    path: [...point.path],
  };
}

export function formatSelectionForDebug(selection?: BaseSelection | null) {
  if (!selection) {
    return null;
  }

  return {
    anchor: formatPointForDebug(selection.anchor),
    focus: formatPointForDebug(selection.focus),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getChildren(value: Record<string, unknown>) {
  if (Array.isArray(value.children)) {
    return value.children;
  }

  if (Array.isArray(value.content)) {
    return value.content;
  }

  return [];
}

function getNodeType(value: Record<string, unknown>) {
  if (typeof value.type === 'string') {
    return value.type;
  }

  if (typeof value.nodeType === 'string') {
    return value.nodeType;
  }

  return 'unknown';
}

export function summarizeRichTextTreeForDebug(value: unknown): TreeSummary {
  const roots = Array.isArray(value) ? value : value ? [value] : [];
  const summary: TreeSummary = {
    maxDepth: 0,
    nodeTypes: {},
    textLength: 0,
    textNodes: 0,
    topLevelNodes: roots.length,
    totalNodes: 0,
  };

  const visit = (node: unknown, depth: number) => {
    if (!isRecord(node)) {
      return;
    }

    summary.totalNodes += 1;
    summary.maxDepth = Math.max(summary.maxDepth, depth);

    if (typeof node.text === 'string') {
      summary.textNodes += 1;
      summary.textLength += node.text.length;
      summary.nodeTypes.text = (summary.nodeTypes.text ?? 0) + 1;
      return;
    }

    if (typeof node.value === 'string') {
      summary.textNodes += 1;
      summary.textLength += node.value.length;
    }

    const nodeType = getNodeType(node);
    summary.nodeTypes[nodeType] = (summary.nodeTypes[nodeType] ?? 0) + 1;
    getChildren(node).forEach((child) => visit(child, depth + 1));
  };

  roots.forEach((root) => visit(root, 1));

  return summary;
}

export function getEditorSnapshotForDebug(editor?: PlateEditor | null) {
  if (!editor) {
    return null;
  }

  return {
    children: summarizeRichTextTreeForDebug(editor.children),
    editorId: (editor as { id?: string }).id,
    prevSelection: formatSelectionForDebug(editor.prevSelection),
    selection: formatSelectionForDebug(editor.selection),
  };
}
