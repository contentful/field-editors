import { getScheduleTooltipContent } from '@contentful/field-editor-reference';
import { isAncestorEmpty } from '@udecode/plate-core';

import { getText } from '../../internal/queries';
import { NodeEntry } from '../../internal/types';
import { RichTextEditor } from '../../types';
import { FetchedEntityData } from './useEntityInfo';

export const hasText = (editor: RichTextEditor, entry: NodeEntry) => {
  const [node, path] = entry;
  return !isAncestorEmpty(editor, node as any) && getText(editor, path).trim() !== '';
};

function truncate(str: string, length: number) {
  if (typeof str === 'string' && str.length > length) {
    return (
      str &&
      str
        .substr(0, length + 1) // +1 to look ahead and be replaced below.
        // Get rid of orphan letters but not one letter words (I, a, 2).
        // Try to not have “.” as last character to avoid awkward “....”.
        .replace(/(\s+\S(?=\S)|\s*)\.?.$/, '…')
    );
  }

  return str;
}

export function getEntityInfo(data?: FetchedEntityData) {
  if (!data) {
    return '';
  }
  const { entityTitle, contentTypeName, entityStatus, jobs } = data;

  const title = truncate(entityTitle, 60) || 'Untitled';

  const scheduledActions =
    jobs.length > 0 ? getScheduleTooltipContent({ job: jobs[0], jobsCount: jobs.length }) : '';

  return `${contentTypeName || 'Asset'} "${title}", ${entityStatus} ${scheduledActions}`;
}
