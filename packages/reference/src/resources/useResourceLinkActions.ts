import { useMemo } from 'react';

import type { FieldAPI, FieldAppSDK } from '@contentful/app-sdk';
import type { ResourceLink } from 'contentful-management';

import { EditorPermissions } from '../common/useEditorPermissions';
import { LinkActionsProps } from '../components';

const getUpdatedValue = (
  field: FieldAPI,
  linkItems: ResourceLink<'Contentful:Entry'>[] | [ResourceLink<'Contentful:Entry'> | null]
) => {
  const multiple = field.type === 'Array';
  if (multiple) {
    const prevValue = field.getValue() || [];
    return [...prevValue, ...linkItems];
  } else {
    return linkItems[0];
  }
};

export function useResourceLinkActions({
  dialogs,
  editorPermissions,
  field,
}: Pick<FieldAppSDK, 'field' | 'dialogs'> & {
  apiUrl: string;
  editorPermissions: EditorPermissions;
}): LinkActionsProps {
  const onLinkedExisting = useMemo(() => {
    return (
      links: ResourceLink<'Contentful:Entry'>[] | [ResourceLink<'Contentful:Entry'> | null]
    ) => {
      const updatedValue = getUpdatedValue(field, links);
      if (updatedValue) {
        field.setValue(updatedValue);
      }
    };
  }, [field]);

  const multiple = field.type === 'Array';
  const onLinkExisting = useMemo(() => {
    const promptSelection = multiple
      ? async (): Promise<ResourceLink<'Contentful:Entry'>[]> =>
          // @ts-expect-error wait for update of app-sdk version
          await dialogs.selectMultipleResourceEntities({
            // @ts-expect-error wait for update of app-sdk version
            allowedResources: field.allowedResources,
          })
      : async (): Promise<[ResourceLink<'Contentful:Entry'> | null]> => [
          // @ts-expect-error wait for update of app-sdk version
          await dialogs.selectSingleResourceEntity({
            // @ts-expect-error wait for update of app-sdk version
            allowedResources: field.allowedResources,
          }),
        ];

    return async () => {
      onLinkedExisting(await promptSelection());
    };
    // @ts-expect-error wait for update of app-sdk version
  }, [dialogs, field.allowedResources, multiple, onLinkedExisting]);

  return {
    onLinkExisting,
    // @ts-expect-error
    onLinkedExisting,
    // hardcoded values to match interface for standard reference field actions
    entityType: 'Entry',
    contentTypes: [],
    canCreateEntity: editorPermissions.canCreateEntity,
    canLinkMultiple: multiple,
    canLinkEntity: editorPermissions.canLinkEntity,
    isDisabled: false,
    isEmpty: false,
    isFull: false,
    // eslint-disable-next-line -- hardcoded values to match interface for standard reference field actions
    onCreate: async () => {},
    // eslint-disable-next-line -- hardcoded values to match interface for standard reference field actions
    onCreated: () => {},
  };
}
