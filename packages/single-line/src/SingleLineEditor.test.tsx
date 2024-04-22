import * as React from 'react';

import { createFakeFieldAPI, createFakeLocalesAPI } from '@contentful/field-editor-test-utils';
import { cleanup, configure, fireEvent, render, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';
import { SingleLineEditor } from './SingleLineEditor';

configure({
  testIdAttribute: 'data-test-id',
});

describe('SingleLineEditor', () => {
  afterEach(cleanup);

  it('renders without crashing', () => {
    const [field] = createFakeFieldAPI((field) => {
      return {
        ...field,
        type: 'Symbol',
      };
    });

    render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />
    );
  });

  it('reads initial value from field.getValue', () => {
    const initialValue = 'initial-value';

    const [field] = createFakeFieldAPI((field) => {
      return {
        ...field,
        id: 'field-id',
        type: 'Symbol',
        getValue: () => {
          return initialValue;
        },
      };
    });

    const { getByTestId } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />
    );

    expect(getByTestId('cf-ui-text-input')).toHaveValue(initialValue);
    expect(getByTestId('cf-ui-char-counter')).toHaveTextContent(`${initialValue.length} / 256`);
  });

  it('calls field.setValue when user types and calls field.removeValue when user clears the input', async () => {
    const [field] = createFakeFieldAPI((field) => {
      jest.spyOn(field, 'setValue');
      jest.spyOn(field, 'removeValue');
      return {
        ...field,
        id: 'field-id',
        type: 'Symbol',
      };
    });

    const { getByTestId } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />
    );

    const $input = getByTestId('cf-ui-text-input');

    expect($input).toHaveValue('');

    fireEvent.change($input, {
      target: { value: 'new-value' },
    });

    await waitFor(() => {
      expect($input).toHaveValue('new-value');
      expect(field.setValue).toHaveBeenCalledTimes(1);
      expect(field.setValue).toHaveBeenLastCalledWith('new-value');
    });

    fireEvent.change($input, {
      target: { value: '' },
    });

    await waitFor(() => {
      expect($input).toHaveValue('');
      expect(field.removeValue).toHaveBeenCalledTimes(1);
      expect(field.removeValue).toHaveBeenLastCalledWith();
    });
  });

  it('shows proper validation message (Symbol)', () => {
    const [field] = createFakeFieldAPI((field) => {
      return {
        ...field,
        type: 'Symbol',
        id: 'field-id',
      };
    });

    const { getByTestId } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />
    );

    expect(getByTestId('cf-ui-char-counter')).toHaveTextContent('0 / 256');
  });

  it('shows proper validation message (Text)', () => {
    const [field] = createFakeFieldAPI((field) => {
      return {
        ...field,
        type: 'Text',
        id: 'field-id',
      };
    });

    const { getByTestId } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />
    );

    expect(getByTestId('cf-ui-char-counter')).toHaveTextContent('0 / 50000');
  });

  it('shows proper min-max validation message', () => {
    const [field] = createFakeFieldAPI((field) => {
      return {
        ...field,
        type: 'Symbol',
        validations: [
          {
            size: {
              min: 100,
              max: 1000,
            },
          },
        ],
        id: 'field-id',
      };
    });

    const { getByTestId } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />
    );

    expect(getByTestId('cf-ui-char-counter')).toHaveTextContent('0 / 1000');
  });

  it('shows proper min validation message', () => {
    const [field] = createFakeFieldAPI((field) => {
      return {
        ...field,
        type: 'Symbol',
        validations: [
          {
            size: {
              min: 1000,
            },
          },
        ],
        id: 'field-id',
      };
    });

    const { getByTestId } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />
    );

    expect(getByTestId('cf-ui-char-counter')).toHaveTextContent('0');
    expect(getByTestId('cf-ui-char-counter')).not.toHaveTextContent('0 / 1000');
  });
});
