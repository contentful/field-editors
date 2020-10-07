declare namespace Cypress {
  interface Chainable {
    editorEvents(lastN?: number): Chainable<Array<any>>;
    setValueExternal(value: any): Chainable<void>;
    setGoogleMapsKey(): Chainable<void>;
    setInitialValue(initialValue: any): void;
    setInitialDisabled(value: boolean | undefined): void;
    setFieldValidations(value: Object[]): void;
    setInstanceParams(value: { [key: string]: any }): void;
    getMarkdownInstance(): Chainable<{
      getContent: () => string;
      selectBackwards: (skip: number, len: number) => void;
      clear: () => void;
      selectAll: () => void;
    }>;
    getRichTextField(): Chainable<{
      getValue: () => object;
    }>;
  }
}
