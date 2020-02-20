/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { css } from 'emotion';
import get from 'lodash/get';
import tokens from '@contentful/forma-36-tokens';
import { ContentType } from '../types';
import {
  Dropdown,
  DropdownList,
  Icon,
  DropdownListItem,
  TextInput
} from '@contentful/forma-36-react-components';
import { useGlobalMouseUp } from './useGlobalMouseUp';

const MAX_ITEMS_WITHOUT_SEARCH = 20;

const styles = {
  wrapper: css({
    position: 'relative'
  }),
  searchInput: css({
    '& > input': {
      borderColor: 'transparent',
      paddingRight: tokens.spacing2Xl,
      '::placeholder': {
        color: tokens.colorTextLight
      }
    }
  }),
  searchIcon: css({
    position: 'absolute',
    right: tokens.spacingM,
    top: tokens.spacingS,
    zIndex: Number(tokens.zIndexDefault),
    fill: tokens.colorTextLight
  }),
  separator: css({
    background: tokens.colorElementLight,
    margin: '10px 0'
  }),
  dropdownList: css({
    borderColor: tokens.colorElementLight
  })
};

interface CreateEntryMenuTrigger {
  contentTypes: ContentType[];
  suggestedContentTypeId?: string;
  onSelect: (contentTypeId: string) => Promise<unknown>;
  testId?: string;
  children: ({
    isOpen,
    isSelecting,
    openMenu
  }: {
    isOpen: boolean;
    isSelecting: boolean;
    openMenu: Function;
  }) => React.ReactElement;
}

export const CreateEntryMenuTrigger = ({
  contentTypes,
  onSelect,
  children,
  testId,
  suggestedContentTypeId
}: CreateEntryMenuTrigger) => {
  const [isOpen, setOpen] = useState(false);
  const [isSelecting, setSelecting] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const wrapper = useRef<any | null>(null);
  const dropdownRef = useRef<any | null>(null);
  /*
    By default, dropdown wraps it's content, so it's width = the width of the widest item
    During search, menu items change, and so the widest menu item can change
    This leads to menu always changing it's width
    To prevent this, we get the width of the menu item after the first mount of a dropdown (when all the content is displayed)
    And hardcode it through the class name. This way we ensure that even during search the menu will keep that max width
    That it had on initial mount and that fits any menu item in has
  */
  const [dropdownWidth, setDropdownWidth] = useState(0);

  const mouseUpHandler = useCallback(
    event => {
      if (
        wrapper &&
        wrapper.current &&
        dropdownRef &&
        dropdownRef.current &&
        !wrapper.current.contains(event.target) &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    },
    [wrapper]
  );

  useGlobalMouseUp(mouseUpHandler);

  useEffect(() => {
    if (!isOpen) {
      setSearchInput('');
    }
  }, [isOpen]);

  const handleSelect = (item: ContentType) => {
    setOpen(false);
    const res = onSelect(item.sys.id);

    // TODO: Convert to controllable component.
    if (res && typeof res.then === 'function') {
      setSelecting(true);
      res.then(
        () => setSelecting(false),
        () => setSelecting(false)
      );
    }
  };

  const openMenu = () => {
    if (contentTypes.length === 1) {
      handleSelect(contentTypes[0]);
    } else {
      setOpen(!isOpen);
    }
  };

  const renderSearchResultsCount = (resultsLength: number) =>
    resultsLength ? (
      <DropdownListItem isTitle testId="add-entru-menu-search-results">
        {resultsLength} result{resultsLength > 1 ? 's' : ''}
      </DropdownListItem>
    ) : null;

  const isSearchable = contentTypes.length > MAX_ITEMS_WITHOUT_SEARCH;
  const maxDropdownHeight = suggestedContentTypeId ? 300 : 250;
  const suggestedContentType = contentTypes.find(ct => ct.sys.id === suggestedContentTypeId);
  const filteredContentTypes = contentTypes.filter(
    ct =>
      !searchInput ||
      get(ct, 'name', 'Untitled')
        .toLowerCase()
        .includes(searchInput.toLowerCase())
  );

  return (
    <span className={styles.wrapper} ref={ref => (wrapper.current = ref)} data-test-id={testId}>
      <Dropdown
        position="bottom-right"
        isAutoalignmentEnabled={!searchInput} // to not wobble when typed
        isOpen={isOpen && contentTypes.length > 1}
        toggleElement={children({ isOpen, isSelecting, openMenu })}
        testId="add-entry-menu"
        // @ts-ignore
        getContainerRef={ref => {
          dropdownRef.current = ref;
          if (!dropdownWidth) {
            setDropdownWidth(ref.clientWidth);
          }
        }}>
        {isSearchable && (
          <div className={styles.wrapper}>
            <TextInput
              className={styles.searchInput}
              placeholder="Search all content types"
              testId="add-entry-menu-search"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <Icon icon="Search" className={styles.searchIcon} />
          </div>
        )}
        <DropdownList
          className={styles.dropdownList}
          border="top"
          styles={{
            width: dropdownWidth || '',
            maxHeight: maxDropdownHeight
          }}
          maxHeight={maxDropdownHeight}>
          {searchInput && renderSearchResultsCount(filteredContentTypes.length)}
          {suggestedContentType && !searchInput && (
            <>
              <DropdownListItem isTitle>Suggested Content Type</DropdownListItem>
              <DropdownListItem
                testId="suggested"
                onClick={() => handleSelect(suggestedContentType)}>
                {get(suggestedContentType, 'name')}
              </DropdownListItem>
              <hr className={styles.separator} />
            </>
          )}
          {!searchInput && <DropdownListItem isTitle>All Content Types</DropdownListItem>}
          {filteredContentTypes.length ? (
            filteredContentTypes.map((contentType, i) => (
              <DropdownListItem
                testId="contentType"
                key={`${get(contentType, 'name')}-${i}`}
                onClick={() => handleSelect(contentType)}>
                {get(contentType, 'name', 'Untitled')}
              </DropdownListItem>
            ))
          ) : (
            <DropdownListItem testId="add-entru-menu-search-results">
              No results found
            </DropdownListItem>
          )}
        </DropdownList>
      </Dropdown>
    </span>
  );
};

CreateEntryMenuTrigger.defaultProps = {
  testId: 'create-entry-button-menu-trigger'
};
