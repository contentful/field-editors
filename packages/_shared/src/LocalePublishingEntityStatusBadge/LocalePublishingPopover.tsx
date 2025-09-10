import React, { useCallback, useRef, useState } from 'react';

import { EntityStatus, EntityStatusBadge, Flex, Popover } from '@contentful/f36-components';
import { CaretDownIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import type {
  LocaleProps,
  EntryProps,
  AssetProps,
  ScheduledActionProps,
} from 'contentful-management';
import { cx, css } from 'emotion';

import { LocalePublishStatusMap } from '../hooks/useLocalePublishStatus';
import * as entityHelpers from '../utils/entityHelpers';
import { LocalePublishingStatusList } from './LocalePublishingStatusList';
import { ScheduledBanner } from './ScheduledBanner';

type BadgeSVGType = {
  isHover: boolean;
} & ({ secondary: EntityStatus; tertiary?: never } | { tertiary: EntityStatus; secondary?: never });

const colors = {
  published: { default: tokens.green300, hover: tokens.green400, icon: tokens.green400 },
  draft: { default: tokens.orange300, hover: tokens.orange400, icon: tokens.orange400 },
  changed: { default: tokens.blue300, hover: tokens.blue400, icon: tokens.blue400 },
  archived: { default: tokens.gray300, hover: tokens.gray400, icon: tokens.gray400 },
  deleted: { default: tokens.red300, hover: tokens.red400, icon: tokens.red400 },
  new: { default: tokens.blue600, hover: tokens.blue700, icon: tokens.blue700 },
};

const getColor = ({ secondary, tertiary, isHover }: BadgeSVGType) => {
  const status = secondary || tertiary;
  return isHover ? colors[status]?.hover : colors[status]?.default;
};

const generateDynamicStyles = (status?: Status) => {
  const wrapperClass = css({
    '& svg[data-status="secondary"]': {
      fill: getColor({
        secondary: status?.secondary,
        isHover: false,
      } as BadgeSVGType),
    },
    '& svg[data-status="tertiary"]': {
      fill: getColor({
        tertiary: status?.tertiary,
        isHover: false,
      } as BadgeSVGType),
    },
    '&:hover svg[data-status="secondary"]': {
      fill: getColor({
        secondary: status?.secondary,
        isHover: true,
      } as BadgeSVGType),
    },
    '&:hover svg[data-status="tertiary"]': {
      fill: getColor({ tertiary: status?.tertiary, isHover: true } as BadgeSVGType),
    },
  });

  return wrapperClass;
};

const getIconColor = (status: 'published' | 'changed' | 'draft') => colors[status].icon;

const styles = {
  badge: css({
    '&:focus': {
      outline: 'none',
      boxShadow: `inset ${tokens.glowPrimary}`, // inset style necessary since wrapper component (SecretiveLink) has overflow hidden
    },
  }),
  wrapper: css({
    '& svg': {
      transition: 'fill 0.2s ease-in-out',
    },
    '& svg[data-status="tertiary"]': {
      marginLeft: '-1px',
    },
  }),
  popoverContent: css({
    maxWidth: '336px',
    maxHeight: '368px',
    overflowY: 'auto',
    padding: `${tokens.spacing2Xs} 0`,
  }),
};

type Status = { primary: EntityStatus; secondary?: EntityStatus; tertiary?: EntityStatus };

const determineBadgeStatus = (
  localesStatusMap?: LocalePublishStatusMap,
  activeLocales?: Pick<LocaleProps, 'code'>[],
): Status | undefined => {
  // Early return for null or undefined locales
  if (!localesStatusMap) return;

  // If there is only one locale, or only active locale, we would not show the stacking
  if (localesStatusMap.size === 1 || (activeLocales && activeLocales.length === 1))
    return { primary: [...localesStatusMap.values()][0].status };

  let draftCount = 0,
    publishedCount = 0,
    changedCount = 0;

  for (const localeStatus of localesStatusMap.values()) {
    if (
      !activeLocales ||
      activeLocales.find((selectedLocale) => selectedLocale.code === localeStatus.locale.code)
    ) {
      switch (localeStatus.status) {
        case 'changed':
          changedCount += 1;
          break;
        case 'draft':
          draftCount += 1;
          break;
        case 'published':
          publishedCount += 1;
          break;
      }
    }
  }

  const hasChanged = changedCount > 0;
  const hasPublished = publishedCount > 0;
  const hasDraft = draftCount > 0;

  switch (true) {
    case hasChanged && hasPublished && hasDraft:
      return { primary: 'changed', secondary: 'published', tertiary: 'draft' };
    case hasChanged && hasPublished:
      return { primary: 'changed', secondary: 'published' };
    case hasChanged && hasDraft:
      return { primary: 'changed', secondary: 'draft' };
    case hasPublished && hasDraft:
      return { primary: 'published', secondary: 'draft' };
    case hasChanged:
      return { primary: 'changed', secondary: 'changed' };
    case hasPublished:
      return { primary: 'published', secondary: 'published' };
    default:
      return { primary: 'draft', secondary: 'draft' };
  }
};

type LocalePublishingPopoverProps = {
  entity: EntryProps | AssetProps;
  jobs: ScheduledActionProps[];
  isScheduled: boolean;
  activeLocales?: Pick<LocaleProps, 'code'>[];
  localesStatusMap?: LocalePublishStatusMap;
};

export function LocalePublishingPopover({
  entity,
  jobs,
  isScheduled,
  localesStatusMap,
  activeLocales,
}: LocalePublishingPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const onMouseEnter = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 300);
  }, []);

  const onMouseLeave = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  }, []);

  const entityStatus = entityHelpers.getEntityStatus(
    entity.sys,
    activeLocales?.map((locale) => locale.code),
  );

  if (['archived', 'deleted'].includes(entityStatus)) {
    return (
      <EntityStatusBadge
        className={styles.badge}
        testId="entity-state"
        entityStatus={entityStatus}
        tabIndex={0}
        isScheduled={isScheduled}
      />
    );
  }

  const status = determineBadgeStatus(localesStatusMap, activeLocales);
  const ariaLabel = status && status.secondary ? 'Multiple statuses' : status?.primary;
  const wrapperClass = generateDynamicStyles(status);

  return (
    <Popover
      isOpen={localesStatusMap && isOpen}
      onClose={() => setIsOpen(false)}
      autoFocus={false}
      placement="bottom-end"
    >
      <Popover.Trigger>
        <Flex
          aria-label={ariaLabel}
          alignItems="center"
          className={cx(styles.wrapper, wrapperClass)}
        >
          <EntityStatusBadge
            className={styles.badge}
            testId="entity-state"
            entityStatus={entityStatus}
            tabIndex={0}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            // @ts-expect-error - type is not exported
            endIcon={<CaretDownIcon size="tiny" color={getIconColor(entityStatus)} />}
            onMouseOver={onMouseEnter}
            isScheduled={isScheduled}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
          {status?.secondary && (
            <svg
              data-status="secondary"
              aria-hidden="true"
              width="4"
              height="18"
              viewBox="0 0 4 18"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.45942e-06 18H0.00296171C2.2121 18 4.00296 16.2091 4.00296 14V4C4.00296 1.79086 2.2121 0 0.00295914 0H0C0.830421 0.732944 1.35418 1.80531 1.35418 3V15C1.35418 16.1947 0.830422 17.2671 1.45942e-06 18Z"
              />
            </svg>
          )}
          {status?.tertiary && (
            <svg data-status="tertiary" aria-hidden="true" width="5" height="16" viewBox="0 0 5 16">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.673828 16.0055H0.675391C2.88453 16.0055 4.67539 14.2146 4.67539 12.0055V3.9955C4.67539 1.88216 3.03648 0.151608 0.960312 0.00549316C1.78382 0.738158 2.30257 1.80597 2.30257 2.99493V12.7838C2.30257 14.1053 1.66172 15.2771 0.673828 16.0055Z"
              />
            </svg>
          )}
        </Flex>
      </Popover.Trigger>
      <Popover.Content
        className={styles.popoverContent}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {!!localesStatusMap && (
          <>
            <ScheduledBanner entityId={entity.sys.id} jobs={jobs} />
            <LocalePublishingStatusList
              isScheduled={isScheduled}
              statusMap={localesStatusMap}
              activeLocales={activeLocales}
            />
          </>
        )}
      </Popover.Content>
    </Popover>
  );
}
