/// <reference types="cypress" />
declare namespace Cypress {
  import type { ComponentFixtures } from '../fixtures';

  interface Chainable {
    tab(arg0?: { shift: boolean }): unknown;
    editorEvents(lastN?: number): Chainable<Array<any>>;
    editorActions(lastN?: number): Chainable<Array<any>>;
    setValueExternal(value: any): Chainable<void>;
    setGoogleMapsKey(): Chainable<void>;
    mockGoogleMapsResponse(mockData: unknown): void;
    setInitialValue(initialValue: any): void;
    setInitialDisabled(value: boolean | undefined): void;
    setRestrictedMarks(value: string[]): void;
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
      setValue: (value: Record<any, any>) => void;
    }>;
    paste(data: { [key: string]: string }): Chainable<void>;
    dragTo(target: () => Chainable): Chainable<void>;
    getComponentFixtures(): Chainable<ComponentFixtures>;
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
