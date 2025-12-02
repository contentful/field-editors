/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect, useMemo } from 'react';

import { TextInput, Menu, type MenuProps } from '@contentful/f36-components';
import { MagnifyingGlassIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { plural, t } from '@lingui/core/macro';
import { css } from 'emotion';
import get from 'lodash/get';

import type { ContentType } from '../../types';

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
    padding: `${tokens.spacing2Xs} ${tokens.spacingXs}`,
  }),
  title: css({
    paddingTop: tokens.spacing2Xs,
    fontWeight: tokens.fontWeightMedium,
  }),
  searchInput: css({
    paddingRight: tokens.spacingXl,
    textOverflow: 'ellipsis',
    minHeight: '32px',
    maxHeight: '32px',
  }),
  searchIcon: css({
    position: 'absolute',
    right: tokens.spacingM,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: Number(tokens.zIndexDefault),
    fill: tokens.gray600,
  }),
  separator: css({
    background: tokens.gray200,
    margin: '10px 0',
  }),
  dropdownList: css({
    minWidth: '230px',
    borderColor: tokens.gray200,
  }),
};

type CreateEntryMenuTriggerChildProps = {
  isOpen: boolean;
  isSelecting: boolean;
};
export type CreateEntryMenuTriggerChild = (
  props: CreateEntryMenuTriggerChildProps,
) => React.ReactElement;
export type CreateCustomEntryMenuItems = ({
  closeMenu,
}: {
  closeMenu: () => void;
}) => React.ReactElement;

interface CreateEntryMenuTrigger {
  contentTypes: ContentType[];
  suggestedContentTypeId?: string;
  contentTypesLabel?: string;
  title?: string;
  onSelect: (contentTypeId: string) => Promise<unknown>;
  testId?: string;
  dropdownSettings?: {
    isAutoalignmentEnabled?: boolean;
    position: 'bottom-left' | 'bottom-right';
  };
  customDropdownItems?: React.ReactNode;
  children: CreateEntryMenuTriggerChild;
  menuProps?: Omit<MenuProps, 'children'>;
  filterExperienceTypes?: boolean;
}

export const CreateEntryMenuTrigger = ({
  contentTypes,
  suggestedContentTypeId,
  contentTypesLabel = t({
    id: 'FieldEditors.Reference.CreateEntryMenuTrigger.AllContentTypesLabel',
    message: 'All Content Types',
  }),
  title,
  onSelect,
  testId = 'create-entry-button-menu-trigger',
  dropdownSettings = {
    position: 'bottom-left',
  },
  customDropdownItems,
  children,
  menuProps,
  filterExperienceTypes = true,
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

  // Filter out content types with the Contentful:ExperienceType annotation
  const filteredContentTypes = useMemo(
    () =>
      filterExperienceTypes
        ? contentTypes.filter((contentType) => {
            const annotations = get(contentType, 'metadata.annotations.ContentType', []);
            return !annotations.some(
              (annotation) => get(annotation, 'sys.id') === 'Contentful:ExperienceType',
            );
          })
        : contentTypes,
    [contentTypes, filterExperienceTypes],
  );

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
        () => setSelecting(false),
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
      <Menu.SectionTitle testId="add-entry-menu-search-results">
        {t({
          id: 'FieldEditors.Reference.CreateEntryMenuTrigger.SearchContentTypeResultsLabel',
          message: plural(resultsLength, {
            one: '# result',
            other: '# results',
          }),
        })}
      </Menu.SectionTitle>
    ) : null;

  const isSearchable = filteredContentTypes.length > MAX_ITEMS_WITHOUT_SEARCH;
  const maxDropdownHeight = suggestedContentTypeId ? 300 : 250;
  const suggestedContentType = filteredContentTypes.find(
    (ct) => ct.sys.id === suggestedContentTypeId,
  );
  const searchFilteredContentTypes = filteredContentTypes.filter(
    (ct) =>
      !searchInput ||
      get(
        ct,
        'name',
        t({
          id: 'FieldEditors.Reference.CreateEntryMenuTrigger.SearchContentTypeFallbackLabel',
          message: 'Untitled',
        }),
      )
        .toLowerCase()
        .includes(searchInput.toLowerCase()),
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
              width: dropdownWidth !== undefined ? `${dropdownWidth}px` : undefined,
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

            {title && <Menu.SectionTitle className={styles.title}>{title}</Menu.SectionTitle>}

            {isSearchable && (
              <div ref={textField} className={styles.inputWrapper}>
                <TextInput
                  className={styles.searchInput}
                  placeholder={t({
                    id: 'FieldEditors.Reference.CreateEntryMenuTrigger.SearchContentTypePlaceholder',
                    message: 'Search content type',
                  })}
                  testId="add-entry-menu-search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <MagnifyingGlassIcon size="small" className={styles.searchIcon} />
              </div>
            )}

            {searchInput && renderSearchResultsCount(searchFilteredContentTypes.length)}

            {suggestedContentType && !searchInput && (
              <>
                <Menu.SectionTitle>
                  {t({
                    id: 'FieldEditors.Reference.CreateEntryMenuTrigger.SuggestedContentTypeLabel',
                    message: 'Suggested Content Type',
                  })}
                </Menu.SectionTitle>
                <Menu.Item testId="suggested" onClick={() => handleSelect(suggestedContentType)}>
                  {get(suggestedContentType, 'name')}
                </Menu.Item>
                <Menu.Divider />
              </>
            )}

            {!searchInput && <Menu.SectionTitle>{contentTypesLabel}</Menu.SectionTitle>}

            {searchFilteredContentTypes.length ? (
              searchFilteredContentTypes.map((contentType, i) => (
                <Menu.Item
                  testId="contentType"
                  key={`${get(contentType, 'name')}-${i}`}
                  onClick={() => handleSelect(contentType)}
                >
                  {get(
                    contentType,
                    'name',
                    t({
                      id: 'FieldEditors.Reference.CreateEntryMenuTrigger.ContentTypeFallbackLabel',
                      message: 'Untitled',
                    }),
                  )}
                </Menu.Item>
              ))
            ) : (
              <Menu.Item testId="add-entry-menu-search-results">
                {t({
                  id: 'FieldEditors.Reference.CreateEntryMenuTrigger.NoResultsLabel',
                  message: 'No results found',
                })}
              </Menu.Item>
            )}
          </Menu.List>
        )}
      </Menu>
    </span>
  );
};
