/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { INLINES } from '@contentful/rich-text-types';

import { cancelFakeDialog, confirmFakeDialog } from '../../fixtures';

export type EmbedType =
  | 'entry-block'
  | 'asset-block'
  | 'resource-block'
  | 'entry-inline'
  | 'resource-inline';

export class RichTextPage {
  get editor() {
    return cy.findByTestId('rich-text-editor').find('[data-slate-editor=true]');
  }

  get toolbar() {
    return {
      get headingsDropdown() {
        return cy.findByTestId('toolbar-heading-toggle');
      },

      toggleHeading(type: string) {
        this.headingsDropdown.click();
        cy.findByTestId(`dropdown-option-${type}`).click({ force: true });
      },

      get undo() {
        return cy.findByTestId('undo-toolbar-button');
      },

      get redo() {
        return cy.findByTestId('redo-toolbar-button');
      },

      get bold() {
        return cy.findByTestId('bold-toolbar-button');
      },

      get italic() {
        return cy.findByTestId('italic-toolbar-button');
      },

      get underline() {
        return cy.findByTestId('underline-toolbar-button');
      },

      get code() {
        return cy.findByTestId('code-toolbar-button');
      },

      get ul() {
        return cy.findByTestId('ul-toolbar-button');
      },

      get ol() {
        return cy.findByTestId('ol-toolbar-button');
      },

      get quote() {
        return cy.findByTestId('quote-toolbar-button');
      },

      get hr() {
        return cy.findByTestId('hr-toolbar-button');
      },

      get hyperlink() {
        return cy.findByTestId('hyperlink-toolbar-button');
      },

      get table() {
        return cy.findByTestId('table-toolbar-button');
      },

      get embedDropdown() {
        return cy.findByTestId('toolbar-entity-dropdown-toggle');
      },

      embed(type: EmbedType, autoConfirm: boolean = true) {
        this.embedDropdown.click();
        cy.findByTestId(`toolbar-toggle-embedded-${type}`).click();
        if (autoConfirm) {
          confirmFakeDialog();
        }
      },
    };
  }

  get forms() {
    return {
      get hyperlink() {
        return new HyperLinkModal();
      },
      get embed() {
        return {
          cancel: cancelFakeDialog,
          confirm: confirmFakeDialog,
        };
      },
    };
  }

  getValue() {
    cy.wait(500);

    return cy.getRichTextField().then((field) => {
      return field.getValue();
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expectValue(expectedValue: any) {
    // we want to make sure any kind of debounced behavior
    // is already triggered before we go on and assert the
    // content of the field in any test. Using cy.clock()
    // doesn't work for some reason
    // eslint-disable-next-line
    cy.wait(500);

    cy.getRichTextField().should((field) => {
      expect(field.getValue()).to.deep.equal(expectedValue);
    });
  }
}

class HyperLinkModal {
  get linkText() {
    return cy.findByTestId('link-text-input');
  }

  get linkType() {
    return cy.findByTestId('link-type-input');
  }

  setLinkType = (
    type:
      | INLINES.HYPERLINK
      | INLINES.ENTRY_HYPERLINK
      | INLINES.ASSET_HYPERLINK
      | INLINES.RESOURCE_HYPERLINK
  ) => {
    this.linkType.select(type);
  };

  get linkTarget() {
    return cy.findByTestId('link-target-input');
  }

  get linkEntityTarget() {
    return cy.findByTestId('entity-selection-link');
  }

  get submit() {
    return cy.findByTestId('confirm-cta');
  }

  get cancel() {
    return cy.findByTestId('cancel-cta');
  }
}
