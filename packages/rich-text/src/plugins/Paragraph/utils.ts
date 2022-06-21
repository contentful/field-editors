export function isEmbedElement(element: HTMLElement) {
  return (
    element.hasAttribute('data-embedded-entity-inline-id') ||
    element.hasAttribute('data-entity-type')
  );
}

export function isEmptyElement(element: HTMLElement) {
  return element.textContent === '';
}
