import { useCallback, useMemo } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { EntryProps, KeyValueMap } from 'contentful-management';
import noop from 'lodash/noop';

import { LinkActionsProps } from '../components';

export function useResourceLinkActions({
  apiUrl,
  dialogs,
  field,
  onAfterLink,
}: Pick<FieldExtensionSDK, 'field' | 'dialogs'> & {
  apiUrl: string;
  onAfterLink?: (e: EntryProps<KeyValueMap>) => void;
}): LinkActionsProps {
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
    function toUrn(entry: EntryProps<KeyValueMap>) {
      return `crn:${apiUrl}:::content:spaces/${entry.sys.space.sys.id}/entries/${entry.sys.id}`;
    }

    return (entry: EntryProps<KeyValueMap>) => {
      return {
        sys: {
          type: 'ResourceLink',
          linkType: 'Contentful:Entry',
          urn: toUrn(entry),
        },
      };
    };
  }, [apiUrl]);

  const onLinkedExisting = useMemo(() => {
    if (multiple) {
      return (entries: EntryProps<KeyValueMap>[]) => {
        const linkItems = entries.map(toLinkItem);
        const prevValue = field.getValue() || [];
        const updatedValue = [...prevValue, ...linkItems];
        field.setValue(updatedValue);
        handleAfterLink(entries);
      };
    } else {
      return (entries: EntryProps<KeyValueMap>[]) => {
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
    onCreate: async () => noop(),
    onCreated: noop,
  };
}
