import * as React from 'react';
import identity from 'lodash/identity';
import { render, configure, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SingleLineEditor } from './SingleLineEditor';
import { createFakeFieldAPI } from '@contentful/field-editor-shared';

configure({
  testIdAttribute: 'data-test-id'
});

jest.mock(
  'lodash/throttle',
  () => ({
    default: identity
  }),
  { virtual: true }
);

describe('SingleLineEditor', () => {
  afterEach(cleanup);

  it('renders without crashing', () => {
    render(<SingleLineEditor field={createFakeFieldAPI()} initialDisabled={false} />);
  });

  it('reads initial value from field.getValue', () => {
    const initialValue = 'initial-value';

    const field = createFakeFieldAPI(field => {
      return {
        ...field,
        id: 'field-id',
        getValue: () => {
          return initialValue;
        }
      };
    });

    const { getByLabelText, getByText } = render(
      <SingleLineEditor field={field} initialDisabled={false} />
    );

    expect(getByLabelText('field-id')).toHaveValue(initialValue);
    expect(getByText(`${initialValue.length} characters`)).toBeInTheDocument();
    expect(getByText('Requires less than 256 characters')).toBeInTheDocument();
  });

  it('calls field.setValue when user types and calls field.removeValue when user clears the input', () => {
    const field = createFakeFieldAPI(field => {
      jest.spyOn(field, 'setValue');
      jest.spyOn(field, 'removeValue');
      return {
        ...field,
        id: 'field-id'
      };
    });

    const { getByLabelText } = render(<SingleLineEditor field={field} initialDisabled={false} />);

    expect(getByLabelText('field-id')).toHaveValue('');

    fireEvent.change(getByLabelText('field-id'), {
      target: { value: 'new-value' }
    });

    expect(getByLabelText('field-id')).toHaveValue('new-value');
    expect(field.setValue).toHaveBeenCalledTimes(1);
    expect(field.setValue).toHaveBeenLastCalledWith('new-value');

    fireEvent.change(getByLabelText('field-id'), {
      target: { value: '' }
    });

    expect(getByLabelText('field-id')).toHaveValue('');
    expect(field.removeValue).toHaveBeenCalledTimes(1);
    expect(field.removeValue).toHaveBeenLastCalledWith();
  });

  it('shows proper min-max validation message', () => {
    const field = createFakeFieldAPI(field => {
      return {
        ...field,
        validations: [
          {
            size: {
              min: 100,
              max: 1000
            }
          }
        ],
        id: 'field-id'
      };
    });

    const { getByText } = render(<SingleLineEditor field={field} initialDisabled={false} />);

    expect(getByText('0 characters')).toBeInTheDocument();
    expect(getByText('Requires between 100 and 1000 characters')).toBeInTheDocument();
  });

  it('shows proper min validation message', () => {
    const field = createFakeFieldAPI(field => {
      return {
        ...field,
        validations: [
          {
            size: {
              min: 1000
            }
          }
        ],
        id: 'field-id'
      };
    });

    const { getByText } = render(<SingleLineEditor field={field} initialDisabled={false} />);

    expect(getByText('0 characters')).toBeInTheDocument();
    expect(getByText('Requires at least 1000 characters')).toBeInTheDocument();
  });
});
