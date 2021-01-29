import type {
  AccessAPI,
  ArchiveableAction,
  CrudAction,
  PublishableAction,
} from '@contentful/app-sdk';
import type { Entry } from '@contentful/field-editor-shared';

function makeEntryFromType(contentTypeId: string) {
  return {
    sys: {
      type: 'Entry',
      contentType: {
        sys: { id: contentTypeId },
      },
    },
    fields: {},
  } as Entry;
}

type EntryAction = CrudAction | PublishableAction | ArchiveableAction;

export function useAccessApi(accessApi: AccessAPI) {
  const canOnEntity = accessApi.can;
  const canOnEntryOfType = (action: EntryAction, contentTypeId: string) => {
    // @ts-expect-error
    return canOnEntity(action, makeEntryFromType(contentTypeId));
  };

  return { canOnEntity, canOnEntryOfType };
}
