import { useCallback, useMemo } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { EntryProps, KeyValueMap } from 'contentful-management';

import { LinkActionsProps } from '../components';
import { ResourceEntity } from '../components/LinkActions/LinkActions';

export function useResourceLinkActions({
  dialogs,
  field,
  onAfterLink,
}: Pick<FieldExtensionSDK, 'field' | 'dialogs'> & {
  apiUrl: string;
  onAfterLink?: (e: EntryProps<KeyValueMap>) => void;
}): LinkActionsProps<ResourceEntity> {
  const handleAfterLink = useCallback(
    (entries: EntryProps<KeyValueMap>[]) => {
      if (!onAfterLink) {
        return;
      }
      entries.forEach(onAfterLink);
    },
    [onAfterLink]
  );
  const multiple = field.type === 'Array';

  const toLinkItem = useMemo(() => {
    return (entry: ResourceEntity) => {
      return {
        sys: {
          type: 'ResourceLink',
          linkType: 'Contentful:Entry',
          urn: entry.sys.urn,
        },
      };
    };
  }, []);

  const onLinkedExisting = useMemo(() => {
    if (multiple) {
      return (entries: ResourceEntity[]) => {
        const linkItems = entries.map(toLinkItem);
        const prevValue = field.getValue() || [];
        const updatedValue = [...prevValue, ...linkItems];
        field.setValue(updatedValue);
        handleAfterLink(entries);
      };
    } else {
      return (entries: ResourceEntity[]) => {
        const [entry] = entries;
        field.setValue(toLinkItem(entry));
        handleAfterLink([entry]);
      };
    }
  }, [field, handleAfterLink, multiple, toLinkItem]);

  const onLinkExisting = useMemo(() => {
    const promptSelection = multiple
      ? async () =>
          // @ts-expect-error wait for update of app-sdk version
          await dialogs.selectMultipleResourceEntries({
            // @ts-expect-error wait for update of app-sdk version
            allowedResources: field.allowedResources,
          })
      : async () => [
          // @ts-expect-error wait for update of app-sdk version
          await dialogs.selectSingleResourceEntry({
            // @ts-expect-error wait for update of app-sdk version
            allowedResources: field.allowedResources,
          }),
        ];

    return async () => {
      const res = await promptSelection();
      if (!res) {
        return;
      }
      onLinkedExisting(res);
    };
    // @ts-expect-error wait for update of app-sdk version
  }, [dialogs, field.allowedResources, multiple, onLinkedExisting]);

  return {
    onLinkExisting,
    onLinkedExisting,
    // hardcoded values to match interface for standard reference field actions
    entityType: 'Entry',
    contentTypes: [],
    canCreateEntity: false,
    canLinkMultiple: multiple,
    canLinkEntity: true,
    isDisabled: false,
    isEmpty: false,
    isFull: false,
    // eslint-disable-next-line -- hardcoded values to match interface for standard reference field actions
    onCreate: async () => {},
    // eslint-disable-next-line -- hardcoded values to match interface for standard reference field actions
    onCreated: () => {},
  };
}
