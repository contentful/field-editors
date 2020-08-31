describe('Multiple Media Editor', () => {
  beforeEach(() => {
    cy.visit('/media-multiple');
  });

  const getDefaultWrapper = () => cy.findByTestId('multiple-media-editor-integration-test');
  const getCustomActionsWrapper = () =>
    cy.findByTestId('multiple-media-editor-custom-actions-integration-test');
  const findCreateAndLinkBtn = () => getDefaultWrapper().findByTestId('linkEditor.createAndLink');
  const findLinkExistingBtn = () => getDefaultWrapper().findByTestId('linkEditor.linkExisting');
  const findCustomLinkActions = () => getCustomActionsWrapper().findAllByTestId('custom-link');
  const findCards = () => getCustomActionsWrapper().findAllByTestId('cf-ui-asset-card');

  it('renders default actions', () => {
    findCreateAndLinkBtn().should('exist');
    findLinkExistingBtn().should('exist');
  });

  it('renders custom actions', () => {
    findCustomLinkActions().should('exist');
  });

  it('is able to interact through props', () => {
    findCustomLinkActions().click();
    findCards().should('have.length', 2);
  });
});
