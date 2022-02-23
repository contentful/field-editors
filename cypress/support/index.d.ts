declare namespace Cypress {
  interface Chainable {
    editorEvents(lastN?: number): Chainable<Array<any>>;
    editorActions(lastN?: number): Chainable<Array<any>>;
    setValueExternal(value: any): Chainable<void>;
    setGoogleMapsKey(): Chainable<void>;
    mockGoogleMapsResponse(mockData: unknown): void;
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
      getValue: () => Record<any, any>;
    }>;
    paste(data: { [key: string]: string }): Chainable<void>;
    dragTo(target: () => Chainable): Chainable<void>;
  }

  type TrackingAction = [
    string,
    {
      origin: string;
      nodeType?: string;
      linkType?: string;
      markType?: string;
      characterCountAfter?: number;
      characterCountBefore?: number;
      characterCountSelection?: number;
    }
  ];

  interface ApplicationWindow {
    actions: TrackingAction[];
  }
}
