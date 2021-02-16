import type {
  AccessAPI,
  ArchiveableAction,
  CrudAction,
  PublishableAction,
} from '@contentful/app-sdk';

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
