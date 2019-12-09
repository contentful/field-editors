declare namespace Cypress {
  interface Chainable {
    editorEvents(): Chainable<Array<any>>;
    setValueExternal(value: any): Chainable<void>;
    setGoogleMapsKey(): Chainable<void>;
    setInitialValue(initialValue: any): void;
    setInitialDisabled(value: boolean | undefined): void;
    setInstanceParams(value: { [key: string]: any }): void;
    getMarkdownInstance(): Chainable<{
      getContent: () => string;
      selectBackwards: (skip: number, len: number) => void;
    }>;
  }
}
