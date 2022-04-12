export function getCaretTopPoint() {
  const sel = document.getSelection();
  if (!sel) return;
  const r = sel.getRangeAt(0);
  let rect;
  let r2;
  // supposed to be textNode in most cases
  // but div[contenteditable] when empty
  const node = r.startContainer;
  const offset = r.startOffset;
  if (offset > 0) {
    // new range, don't influence DOM state
    r2 = document.createRange();
    r2.setStart(node, offset - 1);
    r2.setEnd(node, offset);
    // https://developer.mozilla.org/en-US/docs/Web/API/range.getBoundingClientRect
    // IE9, Safari?(but look good in Safari 8)
    rect = r2.getBoundingClientRect();
    return { left: rect.right, top: rect.top };
    // @ts-expect-error
  } else if (offset < node.length) {
    r2 = document.createRange();
    // similar but select next on letter
    r2.setStart(node, offset);
    r2.setEnd(node, offset + 1);
    rect = r2.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  } else {
    // textNode has length
    // https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect
    // @ts-expect-error
    rect = node.getBoundingClientRect();
    // @ts-expect-error
    const styles = getComputedStyle(node);
    const lineHeight = parseInt(styles.lineHeight);
    const fontSize = parseInt(styles.fontSize);
    // roughly half the whitespace... but not exactly
    const delta = (lineHeight - fontSize) / 2;
    return { left: rect.left, top: rect.top + delta };
  }
}

export function closePanel(editorId: string) {
  document.dispatchEvent(
    new CustomEvent('close-rte-palette-commands', {
      detail: {
        editorId,
      },
    })
  );
}

export function openPanel(editorId: string) {
  document.dispatchEvent(
    new CustomEvent('open-rte-palette-commands', {
      detail: {
        editorId,
      },
    })
  );
}
