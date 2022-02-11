import React from 'react';
import identity from 'lodash/identity';
import { render, configure, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import { NumberEditor } from './NumberEditor';

configure({
  testIdAttribute: 'data-test-id',
});

jest.mock(
  'lodash/throttle',
  () => ({
    default: identity,
  }),
  { virtual: true }
);

function createField({
  initialValue,
  type = 'Integer',
}: {
  initialValue?: number;
  type?: 'Decimal' | 'Integer';
}) {
  const [field] = createFakeFieldAPI((field) => {
    jest.spyOn(field, 'setValue');
    jest.spyOn(field, 'removeValue');
    jest.spyOn(field, 'setInvalid');
    return {
      ...field,
      type,
    };
  }, initialValue);
  return field;
}

describe('NumberEditor', () => {
  afterEach(cleanup);

  it('sets initial value', () => {
    const field = createField({ initialValue: 42 });
    render(<NumberEditor field={field} isInitiallyDisabled={false} />);
    const $input = screen.getByTestId('number-editor-input');

    expect($input).toHaveValue('42');
  });

  it('calls setValue when user inputs valid numbers', () => {
    const field = createField({});
    render(<NumberEditor field={field} isInitiallyDisabled={false} />);
    const $input = screen.getByTestId('number-editor-input');

    userEvent.type($input, '22');
    expect(field.setValue).toHaveBeenCalledWith(22);
  });

  it('when Decimal type it calls setValue for every valid state', () => {
    const field = createField({ type: 'Decimal' });
    render(<NumberEditor field={field} isInitiallyDisabled={false} />);
    const $input = screen.getByTestId('number-editor-input');

    // Testing that `4`, `44`, and `44.2` gets set as valid values while the
    // invalid state `44.` does not get set.
    userEvent.type($input, '44.2');
    expect(field.setValue).toHaveBeenCalledWith(44.2);
    expect(field.setValue).toHaveBeenCalledTimes(3);
  });

  it('does not call setValue when inputting invalid numbers', () => {
    const field = createField({});
    render(<NumberEditor field={field} isInitiallyDisabled={false} />);
    const $input = screen.getByTestId('number-editor-input');

    userEvent.type($input, 'invalid');
    expect(field.setValue).not.toHaveBeenCalled();
  });

  it('calls removeValue when clearing the input', () => {
    const field = createField({ initialValue: 42 });
    render(<NumberEditor field={field} isInitiallyDisabled={false} />);
    const $input = screen.getByTestId('number-editor-input');

    expect($input).toHaveValue('42');

    userEvent.clear($input);
    expect($input).toHaveValue('');
    expect(field.setValue).not.toHaveBeenCalled();
    expect(field.removeValue).toHaveBeenCalledTimes(1);
    expect(field.removeValue).toHaveBeenLastCalledWith();
  });
});
