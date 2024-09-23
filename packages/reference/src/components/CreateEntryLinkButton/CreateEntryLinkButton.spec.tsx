import * as React from 'react';

import '@testing-library/jest-dom';
import {
  act,
  configure,
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import noop from 'lodash/noop';

import { ContentType } from '../../types';
import { CreateEntryLinkButton } from './CreateEntryLinkButton';

configure({
  testIdAttribute: 'data-test-id',
});

const CONTENT_TYPE_1 = { name: 'name-1', sys: { id: 'ID_1' } } as ContentType;
const CONTENT_TYPE_2 = { name: 'name-2', sys: { id: 'ID_2' } } as ContentType;
const CONTENT_TYPE_3 = { name: 'name-3', sys: { id: 'ID_3' } } as ContentType;

const findButton = (getByTestId: Function) => getByTestId('create-entry-link-button');

describe('CreateEntryLinkButton general', () => {
  const props = {
    contentTypes: [CONTENT_TYPE_1, CONTENT_TYPE_2, CONTENT_TYPE_3],
    onSelect: () => {
      return Promise.resolve();
    },
  };

  it('renders with multiple content types as list', () => {
    const { getByTestId } = render(<CreateEntryLinkButton {...props} />);
    expect(getByTestId('create-entry-button-menu-trigger')).toBeDefined();
    const link = findButton(getByTestId);
    expect(link).toBeDefined();
    expect(link.textContent).toBe('Add entry');
  });

  it('renders dropdown menu on click when with multiple content types', () => {
    const { getByTestId } = render(<CreateEntryLinkButton {...props} />);
    fireEvent.click(findButton(getByTestId));
    const menu = getByTestId('add-entry-menu');
    expect(menu).toBeDefined();
    const menuItems = menu.querySelectorAll('[data-test-id="contentType"]');
    expect(menuItems).toHaveLength(props.contentTypes.length);
    menuItems.forEach((item, index) =>
      expect(item.textContent).toBe(props.contentTypes[index].name)
    );
  });

  it('renders suggestedContentType as text when given', () => {
    const suggestedContentTypeId = 'ID_2';
    const { getByTestId } = render(
      <CreateEntryLinkButton {...props} suggestedContentTypeId={suggestedContentTypeId} />
    );
    expect(getByTestId('create-entry-button-menu-trigger')).toBeDefined();
    const button = findButton(getByTestId);
    expect(button).toBeDefined();
    expect(button.textContent).toBe(`Add ${CONTENT_TYPE_2.name}`);
  });

  it('renders the name of the content type as part of the text if only 1 content type is given', () => {
    const { getByTestId } = render(
      <CreateEntryLinkButton onSelect={props.onSelect} contentTypes={[CONTENT_TYPE_1]} />
    );
    expect(getByTestId('create-entry-button-menu-trigger')).toBeDefined();
    const button = findButton(getByTestId);
    expect(button).toBeDefined();
    expect(button.textContent).toBe(`Add ${CONTENT_TYPE_1.name}`);
  });

  it('renders custom text, icon', () => {
    const propsOverrides = {
      text: 'CUSTOM_TEXT',
      hasPlusIcon: true,
    };
    const { getByTestId } = render(<CreateEntryLinkButton {...props} {...propsOverrides} />);
    const link = findButton(getByTestId);
    expect(link.textContent).toBe(propsOverrides.text);
    expect(link.querySelectorAll('svg')).toHaveLength(2);
  });
});

describe('CreateEntryLinkButton with multiple entries', () => {
  const props = {
    contentTypes: [CONTENT_TYPE_1, CONTENT_TYPE_2, CONTENT_TYPE_3],
    onSelect: () => {
      return Promise.resolve();
    },
  };

  it('should render dropdown items for each content type', () => {
    const { getByTestId, getAllByTestId } = render(<CreateEntryLinkButton {...props} />);
    fireEvent.click(findButton(getByTestId));
    expect(getAllByTestId('contentType')).toHaveLength(props.contentTypes.length);
  });

  it('calls onSelect after click on menu item', () => {
    const selectSpy = jest.fn();
    const { getByTestId, getAllByTestId } = render(
      <CreateEntryLinkButton {...props} onSelect={selectSpy} />
    );
    fireEvent.click(findButton(getByTestId));
    fireEvent.click(getAllByTestId('contentType')[1]);
    expect(selectSpy).toHaveBeenCalledWith(CONTENT_TYPE_2.sys.id);
  });
});

describe('CreateEntryLinkButton with a single entry', () => {
  const props = {
    contentTypes: [CONTENT_TYPE_1],
    onSelect: () => {
      return Promise.resolve();
    },
  };

  it('should fire the onSelect function when clicked', () => {
    const onSelectStub = jest.fn();
    const { getByTestId } = render(<CreateEntryLinkButton {...props} onSelect={onSelectStub} />);
    fireEvent.click(findButton(getByTestId));
    expect(onSelectStub).toHaveBeenCalledWith(props.contentTypes[0].sys.id);
    expect(() => getByTestId('cf-ui-spinner')).toThrow(
      'Unable to find an element by: [data-test-id="cf-ui-spinner"]'
    );
  });
});

describe('CreateEntryLinkButton common', () => {
  it('should render a spinner if onSelect returns a promise', async () => {
    const onSelect = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 1000)));
    const { getByTestId, container } = render(
      <CreateEntryLinkButton contentTypes={[CONTENT_TYPE_1]} onSelect={onSelect} />
    );
    fireEvent.click(findButton(getByTestId));
    expect(onSelect).toHaveBeenCalled();
    const spinner = await waitFor(() => getByTestId('cf-ui-spinner'), { container });
    expect(spinner).toBeDefined();
    expect(spinner.textContent).toMatch(/Loading/g);
  });

  it('should hide a spinner after the promise from onSelect resolves', async () => {
    const onSelect = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 500)));
    const { getByTestId, container } = render(
      <CreateEntryLinkButton contentTypes={[CONTENT_TYPE_1]} onSelect={onSelect} />
    );
    fireEvent.click(findButton(getByTestId));
    const getSpinner = () => getByTestId('cf-ui-spinner');
    const spinner = await waitFor(getSpinner, { container });
    expect(spinner).toBeDefined();
    await waitForElementToBeRemoved(() => document.querySelector('[data-test-id="cf-ui-spinner"]'));
    expect(getSpinner).toThrow('Unable to find an element by: [data-test-id="cf-ui-spinner"]');
  });

  it('does not emit onSelect on subsequent click before the promise from onSelect resolves', async () => {
    const onSelect = jest.fn(
      () => new Promise((resolve) => setTimeout(() => resolve(undefined), 200))
    );
    const { getByTestId } = render(
      <CreateEntryLinkButton contentTypes={[CONTENT_TYPE_1]} onSelect={onSelect} />
    );
    fireEvent.click(findButton(getByTestId));
    fireEvent.click(findButton(getByTestId));
    fireEvent.click(findButton(getByTestId));
    await waitFor(noop, { timeout: 1000 });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('emits onSelect on subsequent click after the promise from onSelect resolves', async () => {
    const onSelect = jest.fn(() => Promise.resolve());
    const { getByTestId } = render(
      <CreateEntryLinkButton contentTypes={[CONTENT_TYPE_1]} onSelect={onSelect} />
    );
    await act(async () => {
      fireEvent.click(findButton(getByTestId));
      await waitFor(noop, { timeout: 100 });
      fireEvent.click(findButton(getByTestId));
    });
    expect(onSelect).toHaveBeenCalledTimes(2);
  });
});
