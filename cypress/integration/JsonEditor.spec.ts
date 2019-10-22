it('works', () => {
  cy.visit('/json');
  cy.findByTestId('json-editor-integration-test').should('be.visible');
});
