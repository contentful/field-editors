import React from 'react';
import { render, configure, cleanup, fireEvent, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createFakeFieldAPI } from '@contentful/field-editor-shared';
import { ListEditor } from './ListEditor';

configure({
  testIdAttribute: 'data-test-id'
});

describe('ListEditor', () => {
  afterEach(cleanup);

  function expectInputValue({ getByTestId }: RenderResult, expected: string) {
    const $input = getByTestId('list-editor-input');
    expect($input).toHaveValue(expected);
  }

  function changeInputValue({ getByTestId }: RenderResult, value: string) {
    const $input = getByTestId('list-editor-input');
    fireEvent.change($input, { target: { value } });
  }

  it('renders empty value properly', () => {
    const field = createFakeFieldAPI(mock => {
      return {
        ...mock,
        validations: []
      };
    });
    const renderResult = render(<ListEditor field={field} initialDisabled={false} />);

    expectInputValue(renderResult, '');
  });

  it('renders non-empty value properly', () => {
    const initialValue = ['test1', 'test2', 'test3'];

    const field = createFakeFieldAPI(mock => {
      return {
        ...mock,
        validations: []
      };
    }, initialValue);

    const renderResult = render(<ListEditor field={field} initialDisabled={false} />);

    expectInputValue(renderResult, 'test1, test2, test3');
  });

  it('calls setValue and removeValue when user inputs data', () => {
    const field = createFakeFieldAPI(field => {
      jest.spyOn(field, 'setValue');
      jest.spyOn(field, 'removeValue');
      return {
        ...field,
        validations: []
      };
    });

    const renderResult = render(<ListEditor field={field} initialDisabled={false} />);

    changeInputValue(renderResult, 'test1');

    expect(field.setValue).toHaveBeenLastCalledWith(['test1']);

    changeInputValue(renderResult, 'test1,test2,     test3');

    expectInputValue(renderResult, 'test1, test2, test3');
    expect(field.setValue).toHaveBeenCalledWith(['test1', 'test2', 'test3']);

    changeInputValue(renderResult, '');
    expect(field.removeValue).toHaveBeenCalledTimes(1);
    expect(field.setValue).toHaveBeenCalledTimes(2);
  });
});
