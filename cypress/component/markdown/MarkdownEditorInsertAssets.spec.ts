import { checkValue, renderMarkdownEditor } from './utils';

describe('Markdown Editor / Insert Assets', () => {
  const selectors = {
    getInput: () => {
      return cy.findAllByTestId('markdown-textarea').find('[contenteditable]');
    },
    getInsertMediaDropdown: () => {
      return cy.findByRole('button', { name: 'Insert media' });
    },
    getInsertNewAssetButton: () => {
      return cy.findByRole('menuitem', { name: 'Add new media and link' });
    },
    getInsertExistingAssetButton: () => {
      return cy.findByRole('menuitem', { name: 'Link existing media' });
    },
  };
  it('should insert a new asset', () => {
    renderMarkdownEditor({ spyOnSetValue: true });

    selectors.getInsertMediaDropdown().click();
    selectors.getInsertNewAssetButton().click();

    checkValue(
      '![dog](//images.ctfassets.net/b04hhmxrptgr/6oYURL50Ddai6jRCboSB7u/b1a3768d6d987f3f6110a41175f4d7d3/dog.jpg)'
    );
  });

  it('should insert an existing asset', () => {
    renderMarkdownEditor({ spyOnSetValue: true });

    selectors.getInsertMediaDropdown().click();
    selectors.getInsertExistingAssetButton().click();
    checkValue(
      '![test](//images.ctfassets.net/5uld3crqmsuo/12XMPLSTs2vmmjw6xTlCDg/a7099dad14319e0f2908e99c9a2d6c62/Terrier_mixed-breed_dog.jpg)'
    );
  });
});
