import React from 'react';
import { render, configure, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import { RadioEditor } from './RadioEditor';

configure({
  testIdAttribute: 'data-test-id'
});

describe('RadioEditor', () => {
  afterEach(cleanup);

  it('renders a warning if no options are present', () => {
    const [field] = createFakeFieldAPI(mock => {
      return {
        ...mock,
        validations: []
      };
    });

    const { getByTestId, queryByTestId } = render(
      <RadioEditor field={field} isInitiallyDisabled={false} />
    );

    expect(getByTestId('predefined-values-warning')).toBeInTheDocument();
    expect(queryByTestId('radio-editor')).not.toBeInTheDocument();
  });

  it('renders inputs for predefined values', () => {
    const predefined = ['banana', 'orange', 'strawberry'];
    const [field] = createFakeFieldAPI(mock => {
      return {
        ...mock,
        validations: [{ in: predefined }]
      };
    });
    const { container } = render(<RadioEditor field={field} isInitiallyDisabled={false} />);

    const $inputs = container.querySelectorAll('input[type="radio"]');

    expect($inputs).toHaveLength(3);
    predefined.forEach((item, index) => {
      expect(($inputs[index] as HTMLInputElement).value).toEqual(item);
    });
  });

  it('calls setValue and removeValue properly', () => {
    const [field] = createFakeFieldAPI(field => {
      jest.spyOn(field, 'setValue');
      jest.spyOn(field, 'removeValue');
      return {
        ...field,
        validations: [{ in: ['banana', 'orange', 'strawberry'] }]
      };
    });
    const { container, queryByText, getByText } = render(
      <RadioEditor field={field} isInitiallyDisabled={false} />
    );

    expect(queryByText('Clear')).not.toBeInTheDocument();

    const $inputs = container.querySelectorAll('input[type="radio"]');

    fireEvent.click($inputs[0]);

    expect(field.setValue).toHaveBeenCalledWith('banana');

    fireEvent.click($inputs[1]);

    expect(field.setValue).toHaveBeenCalledWith('orange');

    expect(field.removeValue).toHaveBeenCalledTimes(0);
    fireEvent.click(getByText('Clear'));
    expect(field.removeValue).toHaveBeenCalledTimes(1);
  });

  describe('Number field', () => {
    it('calls setValue and removeValue properly', function() {
      const predefined = [1, '2.71', '0'];
      const [field] = createFakeFieldAPI(field => {
        jest.spyOn(field, 'setValue');
        jest.spyOn(field, 'removeValue');
        return {
          ...field,
          type: 'Number',
          validations: [{ in: predefined }]
        };
      });

      const { container, getByText } = render(
        <RadioEditor field={field} isInitiallyDisabled={false} />
      );

      const $inputs = container.querySelectorAll('input[type="radio"]');

      fireEvent.click($inputs[0]);

      expect(field.setValue).toHaveBeenCalledWith(1);
      expect(field.setValue).toHaveBeenCalledTimes(1);

      fireEvent.click($inputs[1]);

      expect(field.setValue).toHaveBeenCalledWith(2.71);
      expect(field.setValue).toHaveBeenCalledTimes(2);

      fireEvent.click($inputs[2]);

      expect(field.setValue).toHaveBeenCalledWith(0);
      expect(field.setValue).toHaveBeenCalledTimes(3);

      expect(field.removeValue).toHaveBeenCalledTimes(0);
      fireEvent.click(getByText('Clear'));
      expect(field.removeValue).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integer field', () => {
    it('calls setValue and removeValue properly', function() {
      const predefined = [0, '65', '99', 100];
      const [field] = createFakeFieldAPI(field => {
        jest.spyOn(field, 'setValue');
        jest.spyOn(field, 'removeValue');
        return {
          ...field,
          type: 'Number',
          validations: [{ in: predefined }]
        };
      });

      const { container, getByText } = render(
        <RadioEditor field={field} isInitiallyDisabled={false} />
      );

      const $inputs = container.querySelectorAll('input[type="radio"]');

      fireEvent.click($inputs[0]);

      expect(field.setValue).toHaveBeenCalledWith(0);
      expect(field.setValue).toHaveBeenCalledTimes(1);

      fireEvent.click($inputs[1]);

      expect(field.setValue).toHaveBeenCalledWith(65);
      expect(field.setValue).toHaveBeenCalledTimes(2);

      fireEvent.click($inputs[2]);

      expect(field.setValue).toHaveBeenCalledWith(99);
      expect(field.setValue).toHaveBeenCalledTimes(3);

      expect(field.removeValue).toHaveBeenCalledTimes(0);
      fireEvent.click(getByText('Clear'));
      expect(field.removeValue).toHaveBeenCalledTimes(1);
    });
  });
});
