import type { AccessAPI } from '@contentful/app-sdk';

type CrudAction = 'create' | 'read' | 'update' | 'delete';
type PublishableAction = 'publish' | 'unpublish';
type ArchiveableAction = 'archive' | 'unarchive';

type EntryAction = CrudAction | PublishableAction | ArchiveableAction;

type ExtendedAccessAPI = {
  canPerformActionOnEntryOfType: (action: EntryAction, contentTypeId: string) => Promise<boolean>;
};

const AllowActionsOnContentType: ExtendedAccessAPI['canPerformActionOnEntryOfType'] = () =>
  Promise.resolve(true);

export function useAccessApi(accessApi: AccessAPI & Partial<ExtendedAccessAPI>) {
  const canPerformAction = accessApi.can;
  const canPerformActionOnEntryOfType =
    accessApi.canPerformActionOnEntryOfType ?? AllowActionsOnContentType;

  return { canPerformAction, canPerformActionOnEntryOfType };
}
