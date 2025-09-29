import React, { useCallback, useRef, useState } from 'react';

import { Badge, Flex, Popover } from '@contentful/f36-components';
import { CaretDownIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import type { LocaleProps } from 'contentful-management';
import { css, cx } from 'emotion';

import type { ReleaseEntityStatus, ReleaseStatusMap } from '../types';
import { getReleaseStatusBadgeConfig } from '../utils/getReleaseStatusBadgeConfig';
import { ReleaseEntityStatusLocalesList } from './ReleaseEntityStatusLocalesList';

type BadgeSVGType = {
  isHover: boolean;
} & (
  | { secondary: ReleaseEntityStatus; tertiary?: never }
  | { tertiary: ReleaseEntityStatus; secondary?: never }
);

type Status = {
  primary: ReleaseEntityStatus;
  secondary?: ReleaseEntityStatus;
  tertiary?: ReleaseEntityStatus;
};

const getColor = ({ secondary, tertiary, isHover }: BadgeSVGType) => {
  const status = secondary || tertiary;
  const config = getReleaseStatusBadgeConfig(status);
  return isHover ? config?.hover : config?.default;
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
  skeletonBadge: css({
    flexShrink: 0,
    display: 'block',
    height: '20px',
    width: '65px',
  }),
};

const determineBadgeStatus = (
  localesStatusMap: ReleaseStatusMap,
  activeLocales: Pick<LocaleProps, 'code'>[] | undefined,
): Status => {
  // If there is only one locale, or only active locale, we would not show the stacking
  if (activeLocales && activeLocales.length === 1) {
    const activeLocale = activeLocales.find((locale) => localesStatusMap.has(locale.code));
    return { primary: localesStatusMap.get(activeLocale!.code)!.status };
  }

  let becomesDraftCount = 0,
    willPublishCount = 0,
    remainsDraftCount = 0;

  for (const [localeCode, localeStatus] of localesStatusMap.entries()) {
    if (
      !activeLocales ||
      activeLocales.find((selectedLocale) => selectedLocale.code === localeCode)
    ) {
      switch (localeStatus.status) {
        case 'remainsDraft':
          remainsDraftCount += 1;
          break;
        case 'becomesDraft':
          becomesDraftCount += 1;
          break;
        case 'willPublish':
          willPublishCount += 1;
          break;
      }
    }
  }

  const hasRemainsDraft = remainsDraftCount > 0;
  const hasWillPublish = willPublishCount > 0;
  const hasBecomesDraft = becomesDraftCount > 0;

  switch (true) {
    case hasRemainsDraft && hasWillPublish && hasBecomesDraft:
      return { primary: 'becomesDraft', secondary: 'willPublish', tertiary: 'remainsDraft' };
    case hasRemainsDraft && hasWillPublish:
      return { primary: 'willPublish', secondary: 'remainsDraft' };
    case hasRemainsDraft && hasBecomesDraft:
      return { primary: 'becomesDraft', secondary: 'remainsDraft' };
    case hasWillPublish && hasBecomesDraft:
      return { primary: 'becomesDraft', secondary: 'willPublish' };
    case hasWillPublish:
      return { primary: 'willPublish', secondary: 'willPublish' };
    case hasBecomesDraft:
      return { primary: 'becomesDraft', secondary: 'becomesDraft' };
    case hasRemainsDraft:
      return { primary: 'remainsDraft', secondary: 'remainsDraft' };
    default:
      return { primary: 'notInRelease', secondary: 'notInRelease' };
  }
};

type ReleaseLocalePublishingPopoverProps = {
  releaseStatusMap: ReleaseStatusMap;
  activeLocales: Pick<LocaleProps, 'code'>[];
  isLoading?: boolean;
};

export function ReleaseEntityStatusPopover({
  releaseStatusMap,
  activeLocales,
}: ReleaseLocalePublishingPopoverProps) {
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

  const status = determineBadgeStatus(releaseStatusMap, activeLocales);
  const ariaLabel = status.secondary ? 'Multiple statuses' : status.primary;
  const wrapperClass = generateDynamicStyles(status);
  const { label, icon, variant } = getReleaseStatusBadgeConfig(status.primary);
  return (
    <Popover
      isOpen={releaseStatusMap && isOpen}
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
          <Badge
            tabIndex={0}
            variant={variant}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            endIcon={<CaretDownIcon size="tiny" color={icon} />}
            onMouseOver={onMouseEnter}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {label}
          </Badge>
          {status.secondary && (
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
          {status.tertiary && (
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
        {!!releaseStatusMap && (
          <>
            <ReleaseEntityStatusLocalesList
              statusMap={releaseStatusMap}
              activeLocales={activeLocales}
            />
          </>
        )}
      </Popover.Content>
    </Popover>
  );
}
