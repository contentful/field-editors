import * as React from 'react';
import identity from 'lodash/identity';
import { render, configure, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MultipleLineEditor } from './MultipleLineEditor';
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

describe('MultipleLineEditor', () => {
  afterEach(cleanup);

  it('renders without crashing', () => {
    render(<MultipleLineEditor field={createFakeFieldAPI()} initialDisabled={false} />);
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

    const { getByLabelText } = render(<MultipleLineEditor field={field} initialDisabled={false} />);

    expect(getByLabelText('field-id')).toHaveValue(initialValue);
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

    const { getByLabelText } = render(<MultipleLineEditor field={field} initialDisabled={false} />);

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
});
