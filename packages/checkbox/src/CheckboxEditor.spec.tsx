import React from 'react';
import { render, configure, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createFakeFieldAPI, createFakeLocalesAPI } from '@contentful/field-editor-test-utils';
import { CheckboxEditor } from './CheckboxEditor';

configure({
  testIdAttribute: 'data-test-id',
});

describe('CheckboxEditor', () => {
  afterEach(cleanup);

  it('renders a warning if no options are present', () => {
    const [field] = createFakeFieldAPI((mock) => {
      return {
        ...mock,
        items: {
          type: '',
          validations: [],
        },
      };
    });

    const { getByTestId, queryByTestId } = render(
      <CheckboxEditor field={field} locales={createFakeLocalesAPI()} isInitiallyDisabled={false} />
    );

    expect(getByTestId('predefined-values-warning')).toBeInTheDocument();
    expect(queryByTestId('dropdown-editor')).not.toBeInTheDocument();
  });

  it('renders checkboxes for predefined values', () => {
    const predefined = ['banana', 'orange', 'strawberry'];
    const [field] = createFakeFieldAPI((mock) => {
      return {
        ...mock,
        items: {
          type: '',
          validations: [{ in: predefined }],
        },
      };
    });
    const { container } = render(
      <CheckboxEditor field={field} locales={createFakeLocalesAPI()} isInitiallyDisabled={false} />
    );

    const $inputs = container.querySelectorAll('input[type="checkbox"]');

    expect($inputs).toHaveLength(3);
    predefined.forEach((item, index) => {
      expect(($inputs[index] as HTMLInputElement).value).toEqual(item);
    });
  });

  it('calls setValue for every check event and removeValue if all items are unclicked', () => {
    const predefined = ['banana', 'orange', 'strawberry'];
    const [field] = createFakeFieldAPI((mock) => {
      jest.spyOn(mock, 'setValue');
      jest.spyOn(mock, 'removeValue');
      return {
        ...mock,
        items: {
          type: '',
          validations: [{ in: predefined }],
        },
      };
    });
    const { container } = render(
      <CheckboxEditor field={field} locales={createFakeLocalesAPI()} isInitiallyDisabled={false} />
    );

    const $inputs = container.querySelectorAll('input[type="checkbox"]');

    fireEvent.click($inputs[0]);

    expect(field.setValue).toHaveBeenCalledWith([predefined[0]]);
    expect(field.setValue).toHaveBeenCalledTimes(1);

    fireEvent.click($inputs[2]);

    expect(field.setValue).toHaveBeenCalledWith([predefined[0], predefined[2]]);
    expect(field.setValue).toHaveBeenCalledTimes(2);

    fireEvent.click($inputs[1]);

    expect(field.setValue).toHaveBeenCalledWith([predefined[0], predefined[2], predefined[1]]);
    expect(field.setValue).toHaveBeenCalledTimes(3);

    // removing all values
    $inputs.forEach(($input) => {
      fireEvent.click($input);
    });

    expect(field.removeValue).toHaveBeenCalledTimes(1);
  });

  it('renders invalid text and remove link when value set is not in predefined values', () => {
    const predefined = ['banana', 'orange', 'strawberry'];
    const [field] = createFakeFieldAPI((mock) => {
      jest.spyOn(mock, 'setValue');
      jest.spyOn(mock, 'removeValue');
      return {
        ...mock,
        items: {
          type: '',
          validations: [{ in: predefined }],
        },
      };
    });

    // value not included in predefined values
    field.setValue(['mango']);

    const { getByTestId } = render(
      <CheckboxEditor field={field} locales={createFakeLocalesAPI()} isInitiallyDisabled={false} />
    );

    expect(getByTestId('invalid-text')).toBeInTheDocument();
    expect(getByTestId('cf-ui-text-link')).toBeInTheDocument();

    fireEvent.click(getByTestId('cf-ui-text-link'));
    expect(field.removeValue).toHaveBeenCalledTimes(1);
  });

  it('renders checkboxes with unique ids', async () => {
    const predefined = ['banana', 'orange', 'strawberry'];
    const [field] = createFakeFieldAPI((mock) => {
      return {
        ...mock,
        items: {
          type: '',
          validations: [{ in: predefined }],
        },
      };
    });
    const locales = createFakeLocalesAPI();
    const { findAllByTestId } = render(
      <div>
        <CheckboxEditor field={field} locales={locales} isInitiallyDisabled={false} />
        <CheckboxEditor field={field} locales={locales} isInitiallyDisabled={false} />
      </div>
    );

    const $labels = await findAllByTestId('cf-ui-form-label');
    const uniqueIds = Array.from(new Set($labels.map((label) => label.getAttribute('for'))));
    expect(uniqueIds).toHaveLength(6);
  });
});
