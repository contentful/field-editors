import React from 'react';
import identity from 'lodash/identity';
import { render, configure, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import { NumberEditor } from './NumberEditor';

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

describe('NumberEditor', () => {
  afterEach(cleanup);

  it('calls setValue if user select on default option', () => {
    const initialValue = 42;
    const [field] = createFakeFieldAPI(field => {
      jest.spyOn(field, 'setValue');
      jest.spyOn(field, 'removeValue');
      jest.spyOn(field, 'setInvalid');
      return {
        ...field,
        type: 'Integer'
      };
    }, initialValue);

    const { getByTestId } = render(<NumberEditor field={field} isInitiallyDisabled={false} />);

    const $input = getByTestId('number-editor-input');

    expect($input).toHaveValue(42);

    fireEvent.change($input, { target: { value: 'some text' } });
    expect(field.setValue).toHaveBeenCalledTimes(0);
    expect(field.removeValue).toHaveBeenCalledTimes(1);

    fireEvent.change($input, { target: { value: '22' } });
    expect(field.setValue).toHaveBeenCalledWith(22);

    fireEvent.change($input, { target: { value: '44.2' } });
    expect(field.setValue).toHaveBeenCalledTimes(1);

    expect(field.removeValue).toHaveBeenCalledTimes(1);
    fireEvent.change($input, { target: { value: '' } });
    expect(field.removeValue).toHaveBeenCalledTimes(2);
  });
});
