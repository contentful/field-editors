describe('Multiple Media Editor', () => {
  const openPage = () => cy.visit('/media-multiple');

  beforeEach(() => {
    openPage();
  });

  const findCreateAndLinkBtn = (parent: Cypress.Chainable) =>
    parent.findByTestId('linkEditor.createAndLink');
  const findLinkExistingBtn = (parent: Cypress.Chainable) =>
    parent.findByTestId('linkEditor.linkExisting');
  const findCustomActionsDropdownTrigger = (parent: Cypress.Chainable) =>
    parent.findAllByTestId('link-actions-menu-trigger');
  const findCustomActionsDropdown = () => cy.findAllByTestId('cf-ui-dropdown-container');
  const findCards = (parent: Cypress.Chainable) => parent.findAllByTestId('cf-ui-asset-card');

  describe('default editor', () => {
    beforeEach(() => {
      cy.findByTestId('multiple-media-editor-integration-test').as('wrapper');
    });

    it('renders default actions', () => {
      findCreateAndLinkBtn(cy.get('@wrapper')).should('exist');
      findLinkExistingBtn(cy.get('@wrapper')).should('exist');
    });

    it('can insert existing links', () => {
      findLinkExistingBtn(cy.get('@wrapper')).click();
      findCards(cy.get('body')).should('have.length', 2);
    });

    it('can insert new links', () => {
      findCreateAndLinkBtn(cy.get('@wrapper')).click();
      findCards(cy.get('body')).should('have.length', 1);
    });
  });

  describe('custom actions injected actions dropdown', () => {
    beforeEach(() => {
      cy.setFieldValidations([{ size: { max: 2 } }]);
      openPage();
      cy.findByTestId('multiple-media-editor-custom-actions-integration-test').as('wrapper');
    });

    it('is rendered', () => {
      findCustomActionsDropdownTrigger(cy.get('@wrapper')).should('exist');
    });

    it('is able to interact through props', () => {
      findCustomActionsDropdownTrigger(cy.get('@wrapper')).click();
      findLinkExistingBtn(findCustomActionsDropdown()).click();
      findCards(cy.get('body')).should('have.length', 2);
    });

    it('hides actions when max number of allowed links is reached', () => {
      findCustomActionsDropdownTrigger(cy.get('@wrapper')).click();
      findLinkExistingBtn(findCustomActionsDropdown()).click();
      findCards(cy.get('body')).should('have.length', 2);
      findCustomActionsDropdownTrigger(cy.get('@wrapper')).should('not.be.visible');
    });
  });
});
