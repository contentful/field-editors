import React from 'react';
import { render, configure, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createFakeFieldAPI } from '@contentful/field-editor-shared';
import { TagsEditorContainer } from './TagsEditorContainer';

configure({
  testIdAttribute: 'data-test-id'
});

describe('TagsEditor', () => {
  afterEach(cleanup);

  it('renders empty value properly', () => {
    const field = createFakeFieldAPI(mock => {
      return {
        ...mock,
        validations: []
      };
    });
    const { queryByTestId, getByTestId, queryAllByTestId } = render(
      <TagsEditorContainer field={field} initialDisabled={false} />
    );

    const $input = getByTestId('tag-editor-input');
    const $constraints = queryByTestId('tag-editor-constraints');
    const $values = queryAllByTestId('tag-editor-pill');

    expect($input).toHaveValue('');
    expect($constraints).not.toBeInTheDocument();
    expect($values).toHaveLength(0);
  });

  it('renders non-empty value properly', () => {
    const initialValue = ['test1', 'test2', 'test3'];

    const field = createFakeFieldAPI(mock => {
      return {
        ...mock,
        validations: []
      };
    }, initialValue);

    const { queryByTestId, getByTestId, queryAllByTestId } = render(
      <TagsEditorContainer field={field} initialDisabled={false} />
    );

    const $input = getByTestId('tag-editor-input');
    const $constraints = queryByTestId('tag-editor-constraints');
    const $values = queryAllByTestId('tag-editor-pill');

    expect($input).toHaveValue('');
    expect($constraints).not.toBeInTheDocument();
    expect($values).toHaveLength(3);
    expect($values[0].textContent).toEqual('test1');
    expect($values[2].textContent).toEqual('test3');
  });

  describe('renders constraints message', () => {
    const conditions = [
      {
        testType: 'max',
        validation: { max: 10 },
        expected: 'Requires no more than 10 tags'
      },
      {
        testType: 'min',
        validation: { min: 20 },
        expected: 'Requires at least 20 tags'
      },
      {
        testType: 'min-max',
        validation: { min: 10, max: 20 },
        expected: 'Requires between 10 and 20 tags'
      }
    ];

    conditions.forEach(condition => {
      it(condition.testType, () => {
        const field = createFakeFieldAPI(mock => {
          return {
            ...mock,
            validations: [{ size: condition.validation }]
          };
        });

        const { getByTestId } = render(
          <TagsEditorContainer field={field} initialDisabled={false} />
        );

        const $constraints = getByTestId('tag-editor-constraints');
        expect($constraints.textContent).toEqual(condition.expected);
      });
    });
  });

  it('adds and removes values', () => {
    const field = createFakeFieldAPI(field => {
      jest.spyOn(field, 'setValue');
      jest.spyOn(field, 'removeValue');
      return {
        ...field,
        validations: []
      };
    });

    const { getByTestId, getAllByTestId } = render(
      <TagsEditorContainer field={field} initialDisabled={false} />
    );

    const $input = getByTestId('tag-editor-input');

    // add first item
    fireEvent.change($input, { target: { value: 'first item' } });
    fireEvent.keyDown($input, { keyCode: 13 });
    expect(field.setValue).toHaveBeenCalledWith(['first item']);
    expect(field.setValue).toHaveBeenCalledTimes(1);
    expect(field.removeValue).toHaveBeenCalledTimes(0);

    // add second item
    fireEvent.change($input, { target: { value: 'second item' } });
    fireEvent.keyDown($input, { keyCode: 13 });
    expect(field.setValue).toHaveBeenCalledWith(['first item', 'second item']);
    expect(field.setValue).toHaveBeenCalledTimes(2);

    // remove first item

    fireEvent.click(getAllByTestId('tag-editor-pill')[0].querySelector(
      'button'
    ) as HTMLButtonElement);

    expect(field.setValue).toHaveBeenCalledWith(['second item']);
    expect(field.setValue).toHaveBeenCalledTimes(3);

    fireEvent.click(getAllByTestId('tag-editor-pill')[0].querySelector(
      'button'
    ) as HTMLButtonElement);

    expect(field.setValue).toHaveBeenCalledTimes(3);
    expect(field.removeValue).toHaveBeenCalledTimes(1);
  });
});
