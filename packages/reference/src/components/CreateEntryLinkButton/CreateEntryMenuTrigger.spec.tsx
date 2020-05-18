import React from 'react';
import noop from 'lodash/noop';
// eslint-disable-next-line you-dont-need-lodash-underscore/fill
import fill from 'lodash/fill';
import { act, render, fireEvent, configure } from '@testing-library/react';
import { ContentType } from '../../types';
import '@testing-library/jest-dom/extend-expect';

import { CreateEntryMenuTrigger, CreateEntryMenuTriggerChild } from './CreateEntryMenuTrigger';

configure({
  testIdAttribute: 'data-test-id',
});

const CONTENT_TYPE_1 = { name: 'name-1', sys: { id: 'ID_1' } };
const CONTENT_TYPE_2 = { name: 'name-2', sys: { id: 'ID_2' } };
const CONTENT_TYPE_3 = { name: 'name-3', sys: { id: 'ID_3' } };

describe('CreateEntryMenuTrigger general', () => {
  const props = {
    contentTypes: [CONTENT_TYPE_1, CONTENT_TYPE_2, CONTENT_TYPE_3] as ContentType[],
    onSelect: () => {
      return Promise.resolve();
    },
  };

  it('shares the state and functions for the menu', () => {
    const stub: CreateEntryMenuTriggerChild = (api) => {
      expect(api.isOpen).toBe(false);
      expect(api.isSelecting).toBe(false);
      expect(typeof api.openMenu).toBe('function');
      return <span />;
    };

    render(<CreateEntryMenuTrigger {...props}>{stub}</CreateEntryMenuTrigger>);
  });

  it('should open menu after the openMenu call', () => {
    const stub = jest
      .fn()
      .mockImplementationOnce((api) => {
        expect(api.isOpen).toBe(false);
        api.openMenu();
        return null;
      })
      .mockImplementationOnce((api) => {
        expect(api.isOpen).toBe(true);
        return null;
      });

    const { getByTestId, getAllByTestId } = render(
      <CreateEntryMenuTrigger {...props}>{stub}</CreateEntryMenuTrigger>
    );

    expect(getByTestId('create-entry-button-menu-trigger')).toBeDefined();
    expect(getByTestId('add-entry-menu')).toBeDefined();
    expect(getByTestId('add-entry-menu-container')).toBeDefined();
    expect(getAllByTestId('contentType')).toHaveLength(props.contentTypes.length);

    expect(stub).toHaveBeenCalledTimes(2);
  });

  it('should set isSelecting to true in case onSelect returns a promise', async () => {
    const stub = jest
      .fn()
      .mockImplementationOnce((api) => {
        expect(api.isOpen).toBe(false);
        api.openMenu();
        return null;
      })
      .mockImplementationOnce(() => null)
      .mockImplementationOnce((api) => {
        expect(api.isSelecting).toBe(true);
        return null;
      });
    const selectStub = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 1000)));

    const { getAllByTestId } = render(
      <CreateEntryMenuTrigger {...props} onSelect={selectStub}>
        {stub}
      </CreateEntryMenuTrigger>
    );

    act(() => {
      fireEvent.click(getAllByTestId('cf-ui-dropdown-list-item-button')[0]);
    });
    expect(stub).toHaveBeenCalledTimes(4);
    expect(selectStub).toHaveBeenCalled();
  });

  it('should not set isSelecting to true in case onSelect is sync', async () => {
    const stub = jest
      .fn()
      .mockImplementationOnce((api) => {
        expect(api.isOpen).toBe(false);
        api.openMenu();
        return null;
      })
      .mockImplementationOnce(() => null)
      .mockImplementationOnce((api) => {
        expect(api.isSelecting).toBe(false);
        return null;
      });
    const selectStub = jest.fn();

    const { getAllByTestId } = render(
      <CreateEntryMenuTrigger {...props} onSelect={selectStub}>
        {stub}
      </CreateEntryMenuTrigger>
    );

    act(() => {
      fireEvent.click(getAllByTestId('cf-ui-dropdown-list-item-button')[0]);
    });
    expect(stub).toHaveBeenCalledTimes(4);
    expect(selectStub).toHaveBeenCalled();
  });

  it('renders text input if contentTypes.length > 20', () => {
    const stub = jest
      .fn()
      .mockImplementationOnce((api) => {
        api.openMenu();
        return null;
      })
      .mockImplementationOnce(() => null);

    const { getByTestId } = render(
      <CreateEntryMenuTrigger
        {...props}
        contentTypes={fill(Array(21), CONTENT_TYPE_3) as ContentType[]}>
        {stub}
      </CreateEntryMenuTrigger>
    );
    expect(getByTestId('add-entry-menu-search')).toBeDefined();
  });

  it('shows the search results if typed in input', () => {
    const stub = jest
      .fn()
      .mockImplementationOnce((api) => {
        api.openMenu();
        return null;
      })
      .mockImplementationOnce(() => null);

    const contentTypes = fill(
      fill(fill(Array(21), CONTENT_TYPE_1, 0, 10), CONTENT_TYPE_2, 10, 20),
      CONTENT_TYPE_3,
      20
    );

    const { getByTestId, getAllByTestId } = render(
      <CreateEntryMenuTrigger {...props} contentTypes={contentTypes}>
        {stub}
      </CreateEntryMenuTrigger>
    );
    const input = getByTestId('add-entry-menu-search');
    fireEvent.change(input, { target: { value: '1' }, preventDefault: noop });
    expect(getAllByTestId('contentType')).toHaveLength(10);
    expect(getByTestId('add-entru-menu-search-results').textContent).toBe('10 results');

    fireEvent.change(input, { target: { value: '3' }, preventDefault: noop });
    expect(getAllByTestId('contentType')).toHaveLength(1);
    expect(getByTestId('add-entru-menu-search-results').textContent).toBe('1 result');

    fireEvent.change(input, { target: { value: '4' }, preventDefault: noop });
    expect(getByTestId('add-entru-menu-search-results').textContent).toBe('No results found');
  });

  it('shows suggestedContentType in the list', () => {
    const stub = jest
      .fn()
      .mockImplementationOnce((api) => {
        api.openMenu();
        return null;
      })
      .mockImplementationOnce(() => null);

    const { getByTestId } = render(
      <CreateEntryMenuTrigger {...props} suggestedContentTypeId={props.contentTypes[0].sys.id}>
        {stub}
      </CreateEntryMenuTrigger>
    );
    const suggestedContentType = getByTestId('suggested');
    expect(suggestedContentType).toBeDefined();
    expect(suggestedContentType.textContent).toBe(props.contentTypes[0].name);
  });
});
