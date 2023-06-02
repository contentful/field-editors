import * as React from 'react';

import { SpaceAPI } from '@contentful/app-sdk';
import { AssetCard } from '@contentful/f36-components';
import { ClockIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { entityHelpers } from '@contentful/field-editor-shared';
// @ts-expect-error
import mimetype from '@contentful/mimetype';
import { css } from 'emotion';

import { MissingEntityCard, ScheduledIconWithTooltip } from '../../components';
import { Asset, File, RenderDragFn } from '../../types';
import { renderActions, renderAssetInfo } from './AssetCardActions';

const groupToIconMap = {
  image: 'image',
  video: 'video',
  audio: 'audio',
  richtext: 'richtext',
  presentation: 'presentation',
  spreadsheet: 'spreadsheet',
  pdfdocument: 'pdf',
  archive: 'archive',
  plaintext: 'plaintext',
  code: 'code',
  markup: 'markup',
};

const styles = {
  scheduleIcon: css({
    marginRight: tokens.spacing2Xs,
  }),
};

export interface WrappedAssetCardProps {
  getEntityScheduledActions: SpaceAPI['getEntityScheduledActions'];
  asset: Asset;
  localeCode: string;
  defaultLocaleCode: string;
  getAssetUrl?: (assetId: string) => string;
  className?: string;
  isSelected?: boolean;
  isDisabled: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  size: 'default' | 'small';
  renderDragHandle?: RenderDragFn;
  isClickable: boolean;
}

const defaultProps = {
  isClickable: true,
};

// eslint-disable-next-line -- TODO: describe this disable  @typescript-eslint/no-explicit-any
function getFileType(file?: File): any {
  if (!file) {
    return 'archive';
  }

  const groupName: keyof typeof groupToIconMap = mimetype.getGroupLabel({
    type: file.contentType,
    fallbackFileName: file.fileName,
  });

  return groupToIconMap[groupName] || 'archive';
}

export const WrappedAssetCard = (props: WrappedAssetCardProps) => {
  const { className, onEdit, getAssetUrl, onRemove, size, isDisabled, isSelected, isClickable } =
    props;

  // @ts-expect-error
  const status = entityHelpers.getEntryStatus(props.asset.sys);

  if (status === 'deleted') {
    return (
      <MissingEntityCard
        entityType="Asset"
        asSquare
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  const entityTitle = entityHelpers.getAssetTitle({
    asset: props.asset,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode,
    defaultTitle: 'Untitled',
  });

  const entityFile = props.asset.fields.file
    ? props.asset.fields.file[props.localeCode] || props.asset.fields.file[props.defaultLocaleCode]
    : undefined;

  const href = getAssetUrl ? getAssetUrl(props.asset.sys.id) : undefined;

  return (
    <AssetCard
      as={href ? 'a' : 'article'}
      type={getFileType(entityFile)}
      title={entityTitle}
      className={className}
      isSelected={isSelected}
      href={href}
      status={status}
      icon={
        <ScheduledIconWithTooltip
          getEntityScheduledActions={props.getEntityScheduledActions}
          entityType="Asset"
          entityId={props.asset.sys.id}
        >
          <ClockIcon
            className={styles.scheduleIcon}
            size="small"
            variant="muted"
            testId="schedule-icon"
          />
        </ScheduledIconWithTooltip>
      }
      src={
        entityFile && entityFile.url
          ? size === 'small'
            ? `${entityFile.url}?w=150&h=150&fit=thumb`
            : `${entityFile.url}?h=300`
          : ''
      }
      onClick={
        // Providing an onClick handler messes up with some rich text
        // features e.g. pressing ENTER on a card to add a new paragraph
        // underneath. It's crucial not to pass a custom handler when
        // isClickable is disabled which in the case of RT it's.
        isClickable
          ? (e: React.MouseEvent<HTMLElement>) => {
              e.preventDefault();
              onEdit && onEdit();
            }
          : undefined
      }
      /* todo - remove this when onKeyDown is allowed as a prop for BaseCard in forma 36
      // @ts-expect-error */
      onKeyDown={
        isClickable
          ? (e: React.KeyboardEvent<HTMLElement>) => {
              if (e.key === 'Enter' && onEdit) {
                e.preventDefault();
                onEdit();
              }
            }
          : undefined
      }
      dragHandleRender={props.renderDragHandle}
      withDragHandle={!!props.renderDragHandle}
      actions={[
        ...renderActions({ entityFile, isDisabled: isDisabled, onEdit, onRemove }),
        ...(entityFile ? renderAssetInfo({ entityFile }) : []),
      ].filter((item) => item)}
      size={size}
    />
  );
};

WrappedAssetCard.defaultProps = defaultProps;
