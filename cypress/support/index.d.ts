declare namespace Cypress {
  interface Chainable {
    editorEvents(): Chainable<Array<any>>;
  }
}
