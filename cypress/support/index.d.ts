declare namespace Cypress {
  interface Chainable {
    editorEvents(): Chainable<Array<any>>;
    setValueExternal(value: any): Chainable<void>;
  }
}
