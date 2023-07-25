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

    const { getByTestId, getByText } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />
    );

    expect(getByTestId('cf-ui-text-input')).toHaveValue(initialValue);
    expect(getByText(`${initialValue.length} characters`)).toBeInTheDocument();
    expect(getByText('Maximum 256 characters')).toBeInTheDocument();
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

    const { getByText } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />
    );

    expect(getByText('0 characters')).toBeInTheDocument();
    expect(getByText('Maximum 256 characters')).toBeInTheDocument();
  });

  it('shows proper validation message (Text)', () => {
    const [field] = createFakeFieldAPI((field) => {
      return {
        ...field,
        type: 'Text',
        id: 'field-id',
      };
    });

    const { getByText } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />
    );

    expect(getByText('0 characters')).toBeInTheDocument();
    expect(getByText('Maximum 50000 characters')).toBeInTheDocument();
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

    const { getByText } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />
    );

    expect(getByText('0 characters')).toBeInTheDocument();
    expect(getByText('Requires between 100 and 1000 characters')).toBeInTheDocument();
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

    const { getByText } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />
    );

    expect(getByText('0 characters')).toBeInTheDocument();
    expect(getByText('Requires at least 1000 characters')).toBeInTheDocument();
  });

  it('renders no validation message if withCharValidation is falsy', () => {
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

    const { getByText, queryByText } = render(
      <SingleLineEditor
        field={field}
        withCharValidation={false}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />
    );

    expect(getByText('0 characters')).toBeInTheDocument();
    expect(queryByText('Requires between 100 and 1000 characters')).not.toBeInTheDocument();
  });
});
