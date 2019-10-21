/* global global */

import React from 'react';
import identity from 'lodash/identity';
import { render, configure, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createFakeFieldAPI } from '@contentful/field-editor-shared';
import JsonEditor from './JsonEditor';

configure({
  testIdAttribute: 'data-test-id'
});

jest.mock('lodash/throttle', () => identity, { virtual: true });

// @ts-ignore
global.document.body.createTextRange = jest.fn().mockImplementation(() => {
  return {
    setEnd: function() {},
    setStart: function() {},
    getBoundingClientRect: function() {
      return { right: 0 };
    },
    getClientRects: function() {
      return {
        length: 0,
        left: 0,
        right: 0
      };
    }
  };
});

describe('JsonEditor', () => {
  afterEach(cleanup);

  it('renders default state', () => {
    const field = createFakeFieldAPI();
    const { queryByTestId, getByTestId, container } = render(
      <JsonEditor field={field} isInitiallyDisabled={false} />
    );

    expect(queryByTestId('json-editor.invalid-json')).not.toBeInTheDocument();
    expect(getByTestId('json-editor-redo')).toBeDisabled();
    expect(getByTestId('json-editor-undo')).toBeDisabled();
    expect(container.querySelector('textarea')).toHaveValue('');
  });
});
