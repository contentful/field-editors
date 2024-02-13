import * as React from 'react';

import { Badge, EntryCard, MenuItem, MenuDivider } from '@contentful/f36-components';

import { RenderDragFn } from '../../types';
type SysExternalResource<T extends string> = {
  sys: { type: 'Link'; linkType: T; id: string };
};

interface ExternalResource {
  sys: {
    type: string;
    id: string;
    resourceProvider: SysExternalResource<'ResourceProvider'>;
    resourceType: SysExternalResource<'ResourceType'>;
  };
  fields: {
    title: string;
    description?: string;
    externalUrl?: string;
    image?: {
      url?: string;
      description?: string;
    };
    additionalData: any;
  };
}

export interface ExternalResourceCardProps {
  entity: ExternalResource;
  resourceType: string;
  isDisabled: boolean;
  size: 'small' | 'default' | 'auto';
  isSelected?: boolean;
  onRemove?: () => void;
  onEdit?: () => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  renderDragHandle?: RenderDragFn;
  isClickable?: boolean;
  onMoveTop?: () => void;
  onMoveBottom?: () => void;
  hasCardEditActions: boolean;
  hasCardMoveActions?: boolean;
  hasCardRemoveActions?: boolean;
}

const defaultProps = {
  isClickable: true,
  hasCardEditActions: true,
  hasCardMoveActions: true,
  hasCardRemoveActions: true,
};

type ExternalEntityStatus = 'active' | 'archived' | 'suspended' | 'draft';
type BadgeVariant = 'negative' | 'positive' | 'warning';

const statusMap: { [key in ExternalEntityStatus]: BadgeVariant } = {
  active: 'positive',
  draft: 'warning',
  archived: 'negative',
  suspended: 'negative',
};

function ExternalEntityBadge(entityStatus: ExternalEntityStatus) {
  const variant = statusMap[entityStatus];

  return <Badge variant={variant}>{entityStatus}</Badge>;
}

export function ExternalResourceCard({
  entity,
  resourceType,
  size,
  isClickable,
  onEdit,
  onRemove,
  onMoveTop,
  onMoveBottom,
  hasCardEditActions,
  hasCardMoveActions,
  hasCardRemoveActions,
  renderDragHandle,
  onClick,
}: ExternalResourceCardProps) {
  const status = entity.fields.additionalData.status;
  const badge = status ? ExternalEntityBadge(status) : null;
  return (
    <EntryCard
      as={entity.fields.externalUrl ? 'a' : 'article'}
      href={entity.fields.externalUrl}
      title={entity.fields.title}
      description={entity.fields.description}
      contentType={resourceType}
      size={size}
      thumbnailElement={
        entity.fields.image && entity.fields.image.url ? (
          <img alt={entity.fields.image.description} src={entity.fields.image.url} />
        ) : undefined
      }
      dragHandleRender={renderDragHandle}
      withDragHandle={!!renderDragHandle}
      icon={badge}
      actions={
        onEdit || onRemove
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
              hasCardRemoveActions && onRemove ? (
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
              hasCardMoveActions && (onMoveTop || onMoveBottom) ? (
                <MenuDivider key="divider" />
              ) : null,
              hasCardMoveActions && onMoveTop ? (
                <MenuItem key="move-top" onClick={() => onMoveTop && onMoveTop()} testId="move-top">
                  Move to top
                </MenuItem>
              ) : null,
              hasCardMoveActions && onMoveBottom ? (
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

ExternalResourceCard.defaultProps = defaultProps;
