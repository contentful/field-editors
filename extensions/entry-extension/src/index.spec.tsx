/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { EditorExtensionSDK } from 'contentful-ui-extensions-sdk';
import { App } from './index';
import { render, cleanup, configure } from '@testing-library/react';

configure({
  testIdAttribute: 'data-test-id'
});

function renderComponent(sdk: EditorExtensionSDK) {
  return render(<App sdk={sdk} />);
}

const sdk: any = {
  entry: {
    fields: {
      title: { getValue: jest.fn(), setValue: jest.fn() },
      body: { getValue: jest.fn(), setValue: jest.fn() },
      abstract: { getValue: jest.fn(), setValue: jest.fn() },
      hasAbstract: { getValue: jest.fn(), setValue: jest.fn() }
    }
  }
};

describe('App', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(cleanup);

  it('should read a values from entry.fields.*', () => {
    const { getByTestId } = renderComponent(sdk);

    expect(getByTestId('title') as HTMLElement).not.toBeNull();
  });
});
