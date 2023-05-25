import { useCallback, useMemo } from 'react';

import { FieldAPI, FieldExtensionSDK } from '@contentful/app-sdk';
import { EntryProps, WithResourceName } from 'contentful-management';

import { LinkActionsProps } from '../components';

const toLinkItem = (entry: WithResourceName<EntryProps>, apiUrl: string) => ({
  sys: {
    type: 'ResourceLink',
    linkType: 'Contentful:Entry',
    urn:
      entry.sys.urn ??
      `crn:${apiUrl}:::content:spaces/${entry.sys.space.sys.id}/entries/${entry.sys.id}`,
  },
});

const getUpdatedValue = (
  field: FieldAPI,
  entries: WithResourceName<EntryProps>[],
  apiUrl: string
) => {
  const multiple = field.type === 'Array';
  if (multiple) {
    const linkItems = entries.map((entry) => toLinkItem(entry, apiUrl));
    const prevValue = field.getValue() || [];
    return [...prevValue, ...linkItems];
  } else {
    return toLinkItem(entries[0], apiUrl);
  }
};

export function useResourceLinkActions({
  dialogs,
  field,
  onAfterLink,
  apiUrl,
}: Pick<FieldExtensionSDK, 'field' | 'dialogs'> & {
  apiUrl: string;
  onAfterLink?: (e: EntryProps) => void;
}): LinkActionsProps {
  const handleAfterLink = useCallback(
    (entries: EntryProps[]) => {
      if (!onAfterLink) {
        return;
      }
      entries.forEach(onAfterLink);
    },
    [onAfterLink]
  );

  const onLinkedExisting = useMemo(() => {
    return (entries: EntryProps[]) => {
      const updatedValue = getUpdatedValue(
        field,
        entries as WithResourceName<EntryProps>[],
        apiUrl
      );
      field.setValue(updatedValue);
      handleAfterLink(entries);
    };
  }, [field, handleAfterLink, apiUrl]);

  const multiple = field.type === 'Array';
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
    // @ts-expect-error
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
