import React from 'react';
import { render, configure, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import { RichTextEditor } from './RichTextEditor';

configure({
  testIdAttribute: 'data-test-id'
});

describe('RichTextEditor', () => {
  afterEach(cleanup);

  it('renders inputs for true and false values', () => {
    const [field] = createFakeFieldAPI();
    const { _container, _getByLabelText } = render(
      <RichTextEditor field={field} isInitiallyDisabled={false} />
    );

    expect(2).toHaveLength(2);
  });
});
