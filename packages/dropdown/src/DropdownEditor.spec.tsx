import * as React from 'react';

import { createFakeFieldAPI, createFakeLocalesAPI } from '@contentful/field-editor-test-utils';
import '@testing-library/jest-dom/extend-expect';
import { cleanup, configure, fireEvent, render } from '@testing-library/react';

import { DropdownEditor } from './DropdownEditor';

configure({
  testIdAttribute: 'data-test-id',
});

describe('DropdownEditor', () => {
  afterEach(cleanup);

  it('renders a warning if no options are present', () => {
    const [field] = createFakeFieldAPI((mock) => {
      return {
        ...mock,
        validations: [],
      };
    });

    const { getByTestId, queryByTestId } = render(
      <DropdownEditor field={field} locales={createFakeLocalesAPI()} isInitiallyDisabled={false} />
    );

    expect(getByTestId('predefined-values-warning')).toBeInTheDocument();
    expect(queryByTestId('dropdown-editor')).not.toBeInTheDocument();
  });

  it('renders option tags for predefined values', () => {
    const predefined = ['banana', 'orange', 'strawberry'];
    const [field] = createFakeFieldAPI((mock) => {
      return {
        ...mock,
        validations: [{ in: predefined }],
      };
    });
    const { container, getByText } = render(
      <DropdownEditor field={field} locales={createFakeLocalesAPI()} isInitiallyDisabled={false} />
    );

    expect(container.querySelectorAll('option')).toHaveLength(4);
    expect(getByText('Choose a value')).toHaveValue('');
    predefined.forEach((item) => {
      expect(getByText(item)).toHaveValue(item);
    });
  });

  it('calls setValue if user select on default option', () => {
    const [field] = createFakeFieldAPI((field) => {
      jest.spyOn(field, 'setValue');
      jest.spyOn(field, 'removeValue');
      return {
        ...field,
        validations: [{ in: ['initial'] }],
      };
    });
    const { getByTestId } = render(
      <DropdownEditor field={field} locales={createFakeLocalesAPI()} isInitiallyDisabled={false} />
    );
    const changeDropdownValue = (value: string) =>
      fireEvent.change(getByTestId('dropdown-editor'), { target: { value } });

    expect(getByTestId('dropdown-editor')).toHaveValue('');
    changeDropdownValue('initial');
    expect(field.setValue).toHaveBeenCalledWith('initial');
    expect(field.setValue).toHaveBeenCalledTimes(1);
  });

  it('calls removeValue if user selects default option', () => {
    const [field] = createFakeFieldAPI((field) => {
      jest.spyOn(field, 'removeValue');
      return {
        ...field,
        getValue: () => 'initial',
        validations: [{ in: ['initial'] }],
      };
    });
    const { getByTestId } = render(
      <DropdownEditor field={field} locales={createFakeLocalesAPI()} isInitiallyDisabled={false} />
    );
    const changeDropdownValue = (value: string) =>
      fireEvent.change(getByTestId('dropdown-editor'), { target: { value } });
    expect(getByTestId('dropdown-editor')).toHaveValue('initial');
    changeDropdownValue('');
    expect(field.removeValue).toHaveBeenCalledTimes(1);
  });

  it('calls #setValue with number for Number fields', function () {
    const predefined = [1, '2.71', 3];
    const [field] = createFakeFieldAPI((field) => {
      jest.spyOn(field, 'setValue');
      jest.spyOn(field, 'removeValue');
      return {
        ...field,
        type: 'Number',
        validations: [{ in: predefined }],
      };
    });

    const { getByTestId } = render(
      <DropdownEditor field={field} locales={createFakeLocalesAPI()} isInitiallyDisabled={false} />
    );

    const $editorInput = getByTestId('dropdown-editor');

    const changeDropdownValue = (value: string) =>
      fireEvent.change($editorInput, { target: { value } });

    expect($editorInput).toHaveValue('');
    changeDropdownValue('2.71');
    expect($editorInput).toHaveValue('2.71');
    expect(field.setValue).toHaveBeenCalledWith(2.71);
    expect(field.setValue).toHaveBeenCalledTimes(1);
  });

  it('calls #setValue with number for Integer fields', function () {
    const predefined = [0, 1, '2', 3];
    const [field] = createFakeFieldAPI((field) => {
      jest.spyOn(field, 'setValue');
      jest.spyOn(field, 'removeValue');
      return {
        ...field,
        type: 'Number',
        validations: [{ in: predefined }],
      };
    });

    const { getByTestId } = render(
      <DropdownEditor field={field} locales={createFakeLocalesAPI()} isInitiallyDisabled={false} />
    );

    const $editorInput = getByTestId('dropdown-editor');

    const changeDropdownValue = (value: string) =>
      fireEvent.change($editorInput, { target: { value } });

    expect($editorInput).toHaveValue('');
    changeDropdownValue('1');
    expect(field.setValue).toHaveBeenCalledWith(1);
    expect(field.setValue).toHaveBeenCalledTimes(1);

    expect($editorInput).toHaveValue('1');

    changeDropdownValue('0');
    expect(field.setValue).toHaveBeenCalledWith(0);
    expect(field.setValue).toHaveBeenCalledTimes(2);

    expect($editorInput).toHaveValue('0');
  });
});
