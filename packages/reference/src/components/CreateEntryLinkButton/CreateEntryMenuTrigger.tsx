/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect } from 'react';

import { TextInput, Menu, MenuProps } from '@contentful/f36-components';
import { SearchIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import get from 'lodash/get';

import { ContentType } from '../../types';

const MAX_ITEMS_WITHOUT_SEARCH = 5;

const menuPlacementMap: {
  [key: string]: MenuProps['placement'];
} = {
  'bottom-left': 'bottom-start',
  'bottom-right': 'bottom-end',
};

const styles = {
  wrapper: css({
    position: 'relative',
  }),
  inputWrapper: css({
    position: 'relative',
    padding: `0 ${tokens.spacing2Xs}`,
  }),
  searchInput: css({
    paddingRight: tokens.spacingXl,
    textOverflow: 'ellipsis',
  }),
  searchIcon: css({
    position: 'absolute',
    right: tokens.spacingM,
    top: tokens.spacingS,
    zIndex: Number(tokens.zIndexDefault),
    fill: tokens.gray600,
  }),
  separator: css({
    background: tokens.gray200,
    margin: '10px 0',
  }),
  dropdownList: css({
    borderColor: tokens.gray200,
  }),
};

type CreateEntryMenuTriggerChildProps = {
  isOpen: boolean;
  isSelecting: boolean;
};
export type CreateEntryMenuTriggerChild = (
  props: CreateEntryMenuTriggerChildProps
) => React.ReactElement;
export type CreateCustomEntryMenuItems = ({
  closeMenu,
}: {
  closeMenu: Function;
}) => React.ReactElement;

interface CreateEntryMenuTrigger {
  contentTypes: ContentType[];
  suggestedContentTypeId?: string;
  contentTypesLabel?: string;
  onSelect: (contentTypeId: string) => Promise<unknown>;
  testId?: string;
  dropdownSettings?: {
    isAutoalignmentEnabled?: boolean;
    position: 'bottom-left' | 'bottom-right';
  };
  customDropdownItems?: React.ReactNode;
  children: CreateEntryMenuTriggerChild;
  menuProps?: Omit<MenuProps, 'children'>;
}

export const CreateEntryMenuTrigger = ({
  contentTypes,
  suggestedContentTypeId,
  contentTypesLabel,
  onSelect,
  testId,
  dropdownSettings = {
    position: 'bottom-left',
  },
  customDropdownItems,
  children,
  menuProps,
}: CreateEntryMenuTrigger) => {
  const [isOpen, setOpen] = useState(false);
  const [isSelecting, setSelecting] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const wrapper = useRef<any | null>(null);
  const textField = useRef<any | null>(null);
  const menuListRef = useRef<any | null>(null);
  /*
    By default, dropdown wraps it's content, so it's width = the width of the widest item
    During search, menu items change, and so the widest menu item can change
    This leads to menu always changing it's width
    To prevent this, we get the width of the menu item after the first mount of a dropdown (when all the content is displayed)
    And hardcode it through the class name. This way we ensure that even during search the menu will keep that max width
    That it had on initial mount and that fits any menu item in has
  */
  const [dropdownWidth, setDropdownWidth] = useState();

  const hasDropdown = contentTypes.length > 1 || !!customDropdownItems;

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textField.current?.querySelector('input')?.focus({ preventScroll: true });
      }, 200);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !dropdownWidth) {
      setDropdownWidth(menuListRef.current?.clientWidth);
    }
  }, [isOpen, dropdownWidth]);

  const handleSelect = (item: ContentType) => {
    closeMenu();
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

  const handleMenuOpen = () => {
    if (hasDropdown) {
      setOpen(true);
    } else {
      handleSelect(contentTypes[0]);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchInput('');
    }
  }, [isOpen]);

  const renderSearchResultsCount = (resultsLength: number) =>
    resultsLength ? (
      <Menu.SectionTitle testId="add-entru-menu-search-results">
        {resultsLength} result{resultsLength > 1 ? 's' : ''}
      </Menu.SectionTitle>
    ) : null;

  const isSearchable = contentTypes.length > MAX_ITEMS_WITHOUT_SEARCH;
  const maxDropdownHeight = suggestedContentTypeId ? 300 : 250;
  const suggestedContentType = contentTypes.find((ct) => ct.sys.id === suggestedContentTypeId);
  const filteredContentTypes = contentTypes.filter(
    (ct) =>
      !searchInput || get(ct, 'name', 'Untitled').toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <span className={styles.wrapper} ref={wrapper} data-test-id={testId}>
      <Menu
        placement={menuPlacementMap[dropdownSettings.position]}
        isAutoalignmentEnabled={dropdownSettings.isAutoalignmentEnabled}
        isOpen={isOpen}
        onClose={closeMenu}
        onOpen={handleMenuOpen}
        {...menuProps}
      >
        <Menu.Trigger>{children({ isOpen, isSelecting })}</Menu.Trigger>

        {isOpen && (
          <Menu.List
            className={styles.dropdownList}
            style={{
              width: dropdownWidth != undefined ? `${dropdownWidth}px` : undefined,
              maxHeight: `${maxDropdownHeight}px`,
            }}
            ref={menuListRef}
            testId="add-entry-menu"
          >
            {Boolean(customDropdownItems) && (
              <>
                {customDropdownItems}
                <Menu.Divider />
              </>
            )}

            {isSearchable && (
              <>
                <div ref={textField} className={styles.inputWrapper}>
                  <TextInput
                    className={styles.searchInput}
                    placeholder="Search all content types"
                    testId="add-entry-menu-search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <SearchIcon className={styles.searchIcon} />
                </div>
                <Menu.Divider />
              </>
            )}

            {searchInput && renderSearchResultsCount(filteredContentTypes.length)}
            {suggestedContentType && !searchInput && (
              <>
                <Menu.SectionTitle>Suggested Content Type</Menu.SectionTitle>
                <Menu.Item testId="suggested" onClick={() => handleSelect(suggestedContentType)}>
                  {get(suggestedContentType, 'name')}
                </Menu.Item>
                <Menu.Divider />
              </>
            )}
            {!searchInput && <Menu.SectionTitle>{contentTypesLabel}</Menu.SectionTitle>}
            {filteredContentTypes.length ? (
              filteredContentTypes.map((contentType, i) => (
                <Menu.Item
                  testId="contentType"
                  key={`${get(contentType, 'name')}-${i}`}
                  onClick={() => handleSelect(contentType)}
                >
                  {get(contentType, 'name', 'Untitled')}
                </Menu.Item>
              ))
            ) : (
              <Menu.Item testId="add-entru-menu-search-results">No results found</Menu.Item>
            )}
          </Menu.List>
        )}
      </Menu>
    </span>
  );
};

CreateEntryMenuTrigger.defaultProps = {
  testId: 'create-entry-button-menu-trigger',
  contentTypesLabel: 'All Content Types',
};
