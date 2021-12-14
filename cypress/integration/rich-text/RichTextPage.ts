const isValidationEvent = ({ type }) => type === 'onSchemaErrorsChanged';

export class RichTextPage {
  visit() {
    cy.visit('/rich-text');

    this.editor.should('be.visible');
  }

  get editor() {
    return cy.findByTestId('rich-text-editor-integration-test').find('[data-slate-editor=true]');
  }

  get toolbar() {
    return {
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
    };
  }

  expectValue(expectedValue: any, editorEvents?: any) {
    cy.getRichTextField().should((field) => {
      expect(field.getValue()).to.deep.equal(expectedValue);
    });

    const isValidationEvent = ({ type }) => type === 'onSchemaErrorsChanged';

    if (editorEvents) {
      cy.editorEvents()
        .then((events) => {
          return events.filter((event) => !isValidationEvent(event));
        })
        .should('deep.include', { ...editorEvents, value: expectedValue });
    }

    // There can't be any validation error
    this.expectNoValidationErrors();
  }

  expectSnapshotValue() {
    cy.getRichTextField().should((field) => {
      //@ts-expect-error cypress-plugin-snapshots doesn't have type definitions
      cy.wrap(field.getValue()).toMatchSnapshot();
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
}
