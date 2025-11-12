export function isEmbedElement(element) {
    return element.hasAttribute('data-embedded-entity-inline-id') || element.hasAttribute('data-entity-type');
}
export function isEmptyElement(element) {
    return element.textContent === '';
}
