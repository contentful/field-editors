import React from 'react';

import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import { render, configure, cleanup, fireEvent, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { TagsEditorContainer } from './TagsEditorContainer';

configure({
  testIdAttribute: 'data-test-id',
});

describe('TagsEditor', () => {
  afterEach(cleanup);

  function expectNoConstraints({ queryByTestId }: RenderResult) {
    const $constraints = queryByTestId('tag-editor-constraints');
    expect($constraints).not.toBeInTheDocument();
  }

  function expectInputValue({ getByTestId }: RenderResult, expected: string) {
    const $input = getByTestId('tag-editor-input');
    expect($input).toHaveValue(expected);
  }

  function expectTagsCount({ queryAllByTestId }: RenderResult, expectedCount: number) {
    const $values = queryAllByTestId('tag-editor-pill');
    expect($values).toHaveLength(expectedCount);
  }

  function expectTag({ queryAllByTestId }: RenderResult, index: number, content: string) {
    const $values = queryAllByTestId('tag-editor-pill');
    expect($values[index].textContent).toEqual(content);
  }

  function typePendingValueAndHitEnter({ getByTestId }: RenderResult, value: string) {
    const $input = getByTestId('tag-editor-input');
    fireEvent.change($input, { target: { value } });
    fireEvent.keyDown($input, { keyCode: 13 });
  }

  function clickRemoveTag({ getAllByTestId }: RenderResult, index: number) {
    fireEvent.click(
      getAllByTestId('tag-editor-pill')[index].querySelector('button') as HTMLButtonElement
    );
  }

  it('renders empty value properly', () => {
    const [field] = createFakeFieldAPI((mock) => {
      return {
        ...mock,
        validations: [],
      };
    });
    const renderResult = render(<TagsEditorContainer field={field} isInitiallyDisabled={false} />);

    expectNoConstraints(renderResult);
    expectInputValue(renderResult, '');
    expectTagsCount(renderResult, 0);
  });

  it('renders non-empty value properly', () => {
    const initialValue = ['test1', 'test2', 'test3'];

    const [field] = createFakeFieldAPI((mock) => {
      return {
        ...mock,
        validations: [],
      };
    }, initialValue);

    const renderResult = render(<TagsEditorContainer field={field} isInitiallyDisabled={false} />);

    expectInputValue(renderResult, '');
    expectNoConstraints(renderResult);
    expectTagsCount(renderResult, 3);
    expectTag(renderResult, 0, 'test1');
    expectTag(renderResult, 1, 'test2');
    expectTag(renderResult, 2, 'test3');
  });

  describe('renders constraints message', () => {
    const conditions = [
      {
        testType: 'max',
        validation: { max: 10 },
        expected: 'Requires no more than 10 tags',
      },
      {
        testType: 'max-one',
        validation: { max: 1 },
        expected: 'Requires no more than 1 tag',
      },
      {
        testType: 'min',
        validation: { min: 20 },
        expected: 'Requires at least 20 tags',
      },
      {
        testType: 'min-one',
        validation: { min: 1 },
        expected: 'Requires at least 1 tag',
      },
      {
        testType: 'min-max',
        validation: { min: 10, max: 20 },
        expected: 'Requires between 10 and 20 tags',
      },
      {
        testType: 'min-max-equal',
        validation: { min: 10, max: 10 },
        expected: 'Requires exactly 10 tags',
      },
    ];

    conditions.forEach((condition) => {
      // eslint-disable-next-line -- TODO: describe this disable  jest/valid-title
      it(condition.testType, () => {
        const [field] = createFakeFieldAPI((mock) => {
          return {
            ...mock,
            validations: [{ size: condition.validation }],
          };
        });

        const { getByTestId } = render(
          <TagsEditorContainer field={field} isInitiallyDisabled={false} />
        );

        const $constraints = getByTestId('tag-editor-constraints');
        expect($constraints.textContent).toEqual(condition.expected);
      });
    });
  });

  it('adds and removes values', () => {
    const [field] = createFakeFieldAPI((field) => {
      jest.spyOn(field, 'setValue');
      jest.spyOn(field, 'removeValue');
      return {
        ...field,
        validations: [],
      };
    });

    const renderResult = render(<TagsEditorContainer field={field} isInitiallyDisabled={false} />);

    typePendingValueAndHitEnter(renderResult, 'first item');
    expect(field.setValue).toHaveBeenCalledWith(['first item']);
    expect(field.setValue).toHaveBeenCalledTimes(1);
    expect(field.removeValue).toHaveBeenCalledTimes(0);
    expectInputValue(renderResult, '');

    typePendingValueAndHitEnter(renderResult, 'second item');
    expect(field.setValue).toHaveBeenCalledWith(['first item', 'second item']);
    expect(field.setValue).toHaveBeenCalledTimes(2);
    expectInputValue(renderResult, '');

    // remove first item

    clickRemoveTag(renderResult, 0);

    expect(field.setValue).toHaveBeenCalledWith(['second item']);
    expect(field.setValue).toHaveBeenCalledTimes(3);

    clickRemoveTag(renderResult, 0);

    expect(field.setValue).toHaveBeenCalledTimes(3);
    expect(field.removeValue).toHaveBeenCalledTimes(1);
  });
});
