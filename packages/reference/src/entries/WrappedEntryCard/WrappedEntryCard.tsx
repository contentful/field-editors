import * as React from 'react';

import { SpaceAPI } from '@contentful/app-sdk';
import { EntryCard, MenuDivider, MenuItem } from '@contentful/f36-components';
import { PlusIcon } from '@contentful/f36-icons';
import {
  entityHelpers,
  isValidImage,
  LocalePublishStatusMap,
  type ReleaseEntityStatus,
  type ReleaseStatusMap,
  type ReleaseV2Props,
} from '@contentful/field-editor-shared';
import { LocaleProps } from 'contentful-management';

import { AssetThumbnail, MissingEntityCard, EntityStatusBadge } from '../../components';
import { SpaceName } from '../../components/SpaceName/SpaceName';
import { ContentType, Entry, File, RenderDragFn } from '../../types';

const { getEntryTitle, getEntityDescription, getEntityStatus, getEntryImage } = entityHelpers;

export interface WrappedEntryCardProps {
  getEntityScheduledActions: SpaceAPI['getEntityScheduledActions'];
  getAsset: (assetId: string) => Promise<unknown>;
  entryUrl?: string;
  size: 'small' | 'default' | 'auto';
  isDisabled: boolean;
  isSelected?: boolean;
  onRemove?: () => void;
  onEdit?: () => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  localeCode: string;
  defaultLocaleCode: string;
  contentType?: ContentType;
  spaceName?: string;
  entry: Entry;
  renderDragHandle?: RenderDragFn;
  isClickable?: boolean;
  onMoveTop?: () => void;
  onMoveBottom?: () => void;
  hasCardEditActions: boolean;
  hasCardMoveActions?: boolean;
  hasCardRemoveActions?: boolean;
  useLocalizedEntityStatus?: boolean;
  localesStatusMap?: LocalePublishStatusMap;
  activeLocales?: Pick<LocaleProps, 'code'>[];
  releaseEntityStatus?: ReleaseEntityStatus;
  releaseStatusMap?: ReleaseStatusMap;
  release?: ReleaseV2Props;
  onAddToRelease?: () => void;
}

const defaultProps = {
  isClickable: true,
  hasCardEditActions: true,
  hasCardMoveActions: true,
  hasCardRemoveActions: true,
};

export function WrappedEntryCard({
  entry,
  entryUrl,
  contentType,
  activeLocales,
  localeCode,
  defaultLocaleCode,
  localesStatusMap,
  useLocalizedEntityStatus,
  size,
  spaceName,
  isClickable,
  isDisabled,
  isSelected,
  hasCardMoveActions,
  hasCardEditActions,
  hasCardRemoveActions,
  renderDragHandle,
  getAsset,
  getEntityScheduledActions,
  onClick,
  onEdit,
  onRemove,
  onMoveTop,
  onMoveBottom,
  releaseEntityStatus,
  releaseStatusMap,
  release,
  onAddToRelease,
}: WrappedEntryCardProps) {
  const [file, setFile] = React.useState<null | File>(null);

  React.useEffect(() => {
    let mounted = true;

    if (entry) {
      getEntryImage(
        {
          entry,
          contentType,
          localeCode,
          defaultLocaleCode,
        },
        getAsset,
      )
        .then((file) => {
          if (mounted) {
            setFile(file);
          }
        })
        .catch(() => {
          if (mounted) {
            setFile(null);
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, [entry, getAsset, contentType, localeCode, defaultLocaleCode]);

  const status = getEntityStatus(entry?.sys, useLocalizedEntityStatus ? localeCode : undefined);

  if (status === 'deleted') {
    return (
      <MissingEntityCard isDisabled={isDisabled} onRemove={onRemove} providerName="Contentful" />
    );
  }

  const title = getEntryTitle({
    entry,
    contentType,
    localeCode,
    defaultLocaleCode,
    defaultTitle: 'Untitled',
  });

  const description = getEntityDescription({
    entity: entry,
    contentType,
    localeCode,
    defaultLocaleCode,
  });

  const showAddToReleaseAction =
    releaseEntityStatus === 'notInRelease' &&
    release !== undefined &&
    onAddToRelease !== undefined &&
    !isDisabled;

  return (
    <EntryCard
      as={isClickable && entryUrl ? 'a' : 'article'}
      href={isClickable ? entryUrl : undefined}
      title={title}
      description={description}
      contentType={contentType?.name}
      size={size}
      isSelected={isSelected}
      badge={
        <EntityStatusBadge
          status={status}
          entityType="Entry"
          getEntityScheduledActions={getEntityScheduledActions}
          useLocalizedEntityStatus={useLocalizedEntityStatus}
          entity={entry}
          localesStatusMap={localesStatusMap}
          activeLocales={activeLocales}
          releaseEntityStatus={releaseEntityStatus}
          releaseStatusMap={releaseStatusMap}
          release={release}
        />
      }
      icon={
        spaceName ? (
          <SpaceName spaceName={spaceName} environmentName={entry.sys.environment.sys.id} />
        ) : null
      }
      thumbnailElement={file && isValidImage(file) ? <AssetThumbnail file={file} /> : undefined}
      dragHandleRender={renderDragHandle}
      withDragHandle={!!renderDragHandle && !isDisabled}
      draggable={!!renderDragHandle && !isDisabled}
      actions={
        onEdit || onRemove || showAddToReleaseAction
          ? [
              hasCardEditActions && onEdit ? (
                <MenuItem
                  key="edit"
                  testId="edit"
                  onClick={() => {
                    onEdit && onEdit();
                  }}
                >
                  Edit
                </MenuItem>
              ) : null,
              hasCardRemoveActions && onRemove && !isDisabled ? (
                <MenuItem
                  key="delete"
                  testId="delete"
                  onClick={() => {
                    onRemove && onRemove();
                  }}
                >
                  Remove
                </MenuItem>
              ) : null,
              showAddToReleaseAction ? (
                <MenuItem
                  key="add-to-release"
                  testId="add-to-release"
                  onClick={() => {
                    onAddToRelease();
                  }}
                >
                  <PlusIcon size="tiny" />
                  Add to release
                </MenuItem>
              ) : null,
              hasCardMoveActions && (onMoveTop || onMoveBottom) && !isDisabled ? (
                <MenuDivider key="divider" />
              ) : null,
              hasCardMoveActions && onMoveTop && !isDisabled ? (
                <MenuItem key="move-top" onClick={() => onMoveTop && onMoveTop()} testId="move-top">
                  Move to top
                </MenuItem>
              ) : null,
              hasCardMoveActions && onMoveBottom && !isDisabled ? (
                <MenuItem
                  key="move-bottom"
                  onClick={() => onMoveBottom && onMoveBottom()}
                  testId="move-bottom"
                >
                  Move to bottom
                </MenuItem>
              ) : null,
            ].filter((item) => item)
          : []
      }
      onClick={
        // Providing an onClick handler messes up with some rich text
        // features e.g. pressing ENTER on a card to add a new paragraph
        // underneath. It's crucial not to pass a custom handler when
        // isClickable is disabled which in the case of RT it's.
        isClickable
          ? (e: React.MouseEvent<HTMLElement>) => {
              e.preventDefault();
              if (onClick) return onClick(e);
              onEdit && onEdit();
            }
          : undefined
      }
    />
  );
}

WrappedEntryCard.defaultProps = defaultProps;
