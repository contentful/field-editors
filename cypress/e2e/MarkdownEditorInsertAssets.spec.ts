describe('Markdown Editor / Insert Assets', () => {
  const selectors = {
    getInput: () => {
      return cy.get('[data-test-id="markdown-textarea"] [contenteditable]');
    },
    getInsertMediaDropdown: () => {
      return cy.findByTestId('markdownEditor.insertMediaDropdownTrigger');
    },
    getInsertNewAssetButton: () => {
      return cy.findByTestId('markdownEditor.uploadAssetsAndLink');
    },
    getInsertExistingAssetButton: () => {
      return cy.findByTestId('markdownEditor.linkExistingAssets');
    },
  };

  const checkValue = (value) => {
    cy.getMarkdownInstance().then((markdown) => {
      expect(markdown.getContent()).eq(value);
    });
  };

  beforeEach(() => {
    cy.visit('/markdown');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.findByTestId('markdown-editor').should('be.visible');
  });

  it('should insert a new asset', () => {
    selectors.getInsertMediaDropdown().click();
    selectors.getInsertNewAssetButton().click();
    checkValue(
      '![dog](//images.ctfassets.net/b04hhmxrptgr/6oYURL50Ddai6jRCboSB7u/b1a3768d6d987f3f6110a41175f4d7d3/dog.jpg)'
    );
  });

  it('should insert an existing asset', () => {
    selectors.getInsertMediaDropdown().click();
    selectors.getInsertExistingAssetButton().click();
    checkValue(
      '![test](//images.ctfassets.net/5uld3crqmsuo/12XMPLSTs2vmmjw6xTlCDg/a7099dad14319e0f2908e99c9a2d6c62/Terrier_mixed-breed_dog.jpg)'
    );
  });
});
