import React from 'react';
import { render, configure, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import { BooleanEditor } from './BooleanEditor';

configure({
  testIdAttribute: 'data-test-id',
});

describe('BooleanEditor', () => {
  afterEach(cleanup);

  it('renders inputs for true and false values', () => {
    const [field] = createFakeFieldAPI();
    const { container, getByLabelText } = render(
      <BooleanEditor field={field} isInitiallyDisabled={false} />
    );

    const $inputs = container.querySelectorAll('input[type="radio"]');

    expect($inputs).toHaveLength(2);
    [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ].forEach((item, index) => {
      expect(($inputs[index] as HTMLInputElement).value).toEqual(item.value);
      getByLabelText(item.label);
    });
  });

  it('calls setValue and removeValue properly', () => {
    const [field] = createFakeFieldAPI((field) => {
      jest.spyOn(field, 'setValue');
      jest.spyOn(field, 'removeValue');
      return {
        ...field,
      };
    });
    const { getByLabelText, queryByText, getByText } = render(
      <BooleanEditor
        field={field}
        isInitiallyDisabled={false}
        parameters={{
          installation: {},
          instance: {
            trueLabel: 'Yeah, obviously',
            falseLabel: 'No, of course',
          },
        }}
      />
    );

    expect(queryByText('Clear')).not.toBeInTheDocument();

    fireEvent.click(getByLabelText('Yeah, obviously'));

    expect(field.setValue).toHaveBeenCalledWith(true);

    fireEvent.click(getByLabelText('No, of course'));

    expect(field.setValue).toHaveBeenCalledWith(false);

    expect(field.removeValue).toHaveBeenCalledTimes(0);
    fireEvent.click(getByText('Clear'));
    expect(field.removeValue).toHaveBeenCalledTimes(1);
  });
});
