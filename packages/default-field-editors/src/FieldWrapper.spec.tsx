import React from 'react';

import type { FieldExtensionSDK } from '@contentful/field-editor-shared';
import { createFakeFieldAPI, createFakeLocalesAPI } from '@contentful/field-editor-test-utils';
import '@testing-library/jest-dom/extend-expect';
import { act, cleanup, configure, render } from '@testing-library/react';

import { FieldWrapper } from './FieldWrapper';

configure({
  testIdAttribute: 'data-test-id',
});

const [field, emitter] = createFakeFieldAPI();
const sdk: FieldExtensionSDK = {
  contentType: {
    sys: {
      id: 'content-type-id',
    },
  },
  field,
  locales: createFakeLocalesAPI(),
} as any;
const getEntryURL = () => '';

describe('Field', () => {
  afterEach(cleanup);

  it('renders children, label, validation errors and help text', () => {
    sdk.parameters = { instance: { helpText: 'help' } } as any;

    const { queryByTestId } = render(
      <FieldWrapper name="field" sdk={sdk} getEntryURL={getEntryURL}>
        <div data-test-id="children">children</div>
      </FieldWrapper>
    );
    // Add a validation error so ValidationErrors would render
    act(() => {
      emitter.emit('onSchemaErrorsChanged', ['error']);
    });

    expect(queryByTestId('entity-field-controls')).toBeInTheDocument();
    expect(queryByTestId('cf-ui-form-label')).toBeInTheDocument();
    expect(queryByTestId('children')).toBeInTheDocument();
    expect(queryByTestId('validation-errors')).toBeInTheDocument();
    expect(queryByTestId('field-hint')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    const { queryByTestId } = render(
      <FieldWrapper
        name="field"
        sdk={sdk}
        getEntryURL={getEntryURL}
        renderHeading={() => <div data-test-id="custom-label">custom label</div>}
      >
        <div>children</div>
      </FieldWrapper>
    );
    expect(queryByTestId('custom-label')).toBeInTheDocument();
  });

  it('renders custom help text', () => {
    const { queryByTestId } = render(
      <FieldWrapper
        name="field"
        sdk={sdk}
        getEntryURL={getEntryURL}
        renderHelpText={() => <div data-test-id="custom-hint">custom hint</div>}
      >
        <div>children</div>
      </FieldWrapper>
    );
    expect(queryByTestId('custom-hint')).toBeInTheDocument();
  });
});
