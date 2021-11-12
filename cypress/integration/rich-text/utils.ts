export function expectRichTextFieldValue(expectedValue, editorEvents?) {
  cy.getRichTextField().should((field) => {
    expect(field.getValue()).to.deep.equal(expectedValue);
  });

  if (editorEvents) {
    cy.editorEvents().should('deep.include', { ...editorEvents, value: expectedValue });
  }
}
