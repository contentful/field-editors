declare namespace Cypress {
  interface Chainable {
    editorEvents(): Chainable<Array<any>>;
    setValueExternal(value: any): Chainable<void>;
    setGoogleMapsKey(): Chainable<void>;
    setInitialValue(initialValue: any): void;
    setInitialDisabled(value: boolean | undefined): void;
  }
}
