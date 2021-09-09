describe('Multiple Reference Editor', () => {
  const openPage = () => cy.visit('/reference-multiple');

  beforeEach(() => {
    openPage();
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

  it('hides actions when max number of allowed links is reached', () => {
    cy.setFieldValidations([{ size: { max: 3 } }]);
    openPage();
    findLinkExistingBtn().click();
    findLinkExistingBtn().click(); // inserts 2 cards
    findLinkExistingBtn().should('not.exist'); // limit reached, button hidden.
  });
});
