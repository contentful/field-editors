describe('Multiple Reference Editor', () => {
  beforeEach(() => {
    cy.visit('/reference-multiple');
  });

  const getWrapper = () =>
    cy.findByTestId('multiple-references-editor-custom-cards-integration-test');
  const findLinkExistingBtn = () => getWrapper().findByTestId('linkEditor.linkExisting');
  const findCustomCards = () => getWrapper().findAllByTestId('custom-card');
  const findDefaultCards = () => getWrapper().findAllByTestId('cf-ui-entry-card');

  it('is empty by default', () => {
    findCustomCards().should('not.exist');
    findLinkExistingBtn().click();
  });

  it('renders custom cards', () => {
    findLinkExistingBtn().click();
    findCustomCards().should('have.length', 2);
  });

  it('renders default card instead of custom card', () => {
    findLinkExistingBtn().click();
    findLinkExistingBtn().click(); // Inserts another card using standard card renderer.
    findDefaultCards().should('have.length', 1);
    findCustomCards().should('have.length', 2);
  });
});
