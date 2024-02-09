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
  // the field values are Record<string, unknown> to apply localization if the provider supports it
  fields: {
    // maybe we need some mandatory fields that the search backend maps to from the original entity format,
    // this way we have specific fields that we can render in the search cards regardless of provider/resource type.
    title: string;
    description?: string;
    externalUrl?: string;
    image?: Record<string, unknown>; // object to handle eg accesibility
    additionalData: any; // should we keep it or not TBD
  };
}

export interface ExternalResourceCardProps {
  entity: ExternalResource;
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

export function ExternalResourceCard(props: ExternalResourceCardProps) {
  const status = props.entity.fields.additionalData.status;
  const badge = status ? ExternalEntityBadge(status) : null;
  return (
    <EntryCard
      as={props.entity.fields.externalUrl ? 'a' : 'article'}
      href={props.entity.fields.externalUrl}
      title={props.entity.fields.title}
      description={props.entity.fields.description}
      contentType={props.entity.sys.resourceType.sys.id.split(':').join(' ')}
      size={props.size}
      thumbnailElement={
        props.entity.fields.image && typeof props.entity.fields.image.url === 'string' ? (
          <img alt="random" src={props.entity.fields.image.url} />
        ) : undefined
      }
      dragHandleRender={props.renderDragHandle}
      withDragHandle={!!props.renderDragHandle}
      icon={badge}
      actions={
        props.onEdit || props.onRemove
          ? [
              props.hasCardEditActions && props.onEdit ? (
                <MenuItem
                  key="edit"
                  testId="edit"
                  onClick={() => {
                    props.onEdit && props.onEdit();
                  }}
                >
                  Edit
                </MenuItem>
              ) : null,
              props.hasCardRemoveActions && props.onRemove ? (
                <MenuItem
                  key="delete"
                  testId="delete"
                  onClick={() => {
                    props.onRemove && props.onRemove();
                  }}
                >
                  Remove
                </MenuItem>
              ) : null,
              props.hasCardMoveActions && (props.onMoveTop || props.onMoveBottom) ? (
                <MenuDivider key="divider" />
              ) : null,
              props.hasCardMoveActions && props.onMoveTop ? (
                <MenuItem
                  key="move-top"
                  onClick={() => props.onMoveTop && props.onMoveTop()}
                  testId="move-top"
                >
                  Move to top
                </MenuItem>
              ) : null,
              props.hasCardMoveActions && props.onMoveBottom ? (
                <MenuItem
                  key="move-bottom"
                  onClick={() => props.onMoveBottom && props.onMoveBottom()}
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
        props.isClickable
          ? (e: React.MouseEvent<HTMLElement>) => {
              e.preventDefault();
              if (props.onClick) return props.onClick(e);
              props.onEdit && props.onEdit();
            }
          : undefined
      }
    />
  );
}

ExternalResourceCard.defaultProps = defaultProps;
