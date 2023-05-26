/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { INLINES } from '@contentful/rich-text-types';

import { getIframe } from '../../fixtures/utils';

const isValidationEvent = ({ type }) => type === 'onSchemaErrorsChanged';

export type EmbedType = 'entry-block' | 'asset-block' | 'entry-inline';

export class RichTextPage {
  visit() {
    cy.visit('/?path=/docs/editors-rich-text-editor--docs');

    this.editor.should('be.visible');
  }

  get editor() {
    return getIframe().findByTestId('rich-text-editor').find('[data-slate-editor=true]');
  }

  get toolbar() {
    return {
      get headingsDropdown() {
        return getIframe().findByTestId('toolbar-heading-toggle');
      },

      toggleHeading(type: string) {
        this.headingsDropdown.click();
        getIframe().findByTestId(`dropdown-option-${type}`).click({ force: true });
      },

      get bold() {
        return getIframe().findByTestId('bold-toolbar-button');
      },

      get italic() {
        return getIframe().findByTestId('italic-toolbar-button');
      },

      get underline() {
        return getIframe().findByTestId('underline-toolbar-button');
      },

      get code() {
        return getIframe().findByTestId('code-toolbar-button');
      },

      get ul() {
        return getIframe().findByTestId('ul-toolbar-button');
      },

      get ol() {
        return getIframe().findByTestId('ol-toolbar-button');
      },

      get quote() {
        return getIframe().findByTestId('quote-toolbar-button');
      },

      get hr() {
        return getIframe().findByTestId('hr-toolbar-button');
      },

      get hyperlink() {
        return getIframe().findByTestId('hyperlink-toolbar-button');
      },

      get table() {
        return getIframe().findByTestId('table-toolbar-button');
      },

      get embedDropdown() {
        return getIframe().findByTestId('toolbar-entity-dropdown-toggle');
      },

      embed(type: EmbedType) {
        this.embedDropdown.click();
        getIframe().findByTestId(`toolbar-toggle-embedded-${type}`).click();
      },
    };
  }

  get forms() {
    return {
      get hyperlink() {
        return new HyperLinkModal();
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

    // There can't be any validation error
    this.expectNoValidationErrors();
  }

  expectSnapshotValue() {
    // we want to make sure any kind of debounced behavior
    // is already triggered before we go on and assert the
    // content of the field in any test. Using cy.clock()
    // doesn't work for some reason
    // eslint-disable-next-line
    cy.wait(500);

    cy.getRichTextField().then((field) => {
      //@ts-expect-error cypress-plugin-snapshots doesn't have type definitions
      cy.wrap(field.getValue()).snapshot();
    });

    // There can't be any validation error
    this.expectNoValidationErrors();
  }

  expectNoValidationErrors() {
    cy.editorEvents()
      .then((events) => {
        return events.filter((ev) => isValidationEvent(ev) && ev.value.length > 0);
      })
      .should('be.empty')
      .as('validationErrors');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expectTrackingValue(expectedValue: any) {
    cy.window()
      .should((win) => {
        expect(win.actions).to.deep.equal(expectedValue);
      })
      .as('trackingValue');
  }
}

class HyperLinkModal {
  get linkText() {
    return getIframe().findByTestId('link-text-input');
  }

  get linkType() {
    return getIframe().findByTestId('link-type-input');
  }

  setLinkType = (type: INLINES.HYPERLINK | INLINES.ENTRY_HYPERLINK | INLINES.ASSET_HYPERLINK) => {
    this.linkType.select(type);
  };

  get linkTarget() {
    return getIframe().findByTestId('link-target-input');
  }

  get linkEntityTarget() {
    return getIframe().findByTestId('entity-selection-link');
  }

  get submit() {
    return getIframe().findByTestId('confirm-cta');
  }

  get cancel() {
    return getIframe().findByTestId('cancel-cta');
  }
}
