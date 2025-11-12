import { getScheduleTooltipContent } from '@contentful/field-editor-reference';
import { isAncestorEmpty } from '@udecode/plate-common';
import { getText } from '../../internal/queries';
import { truncateTitle } from '../../plugins/shared/utils';
export const hasText = (editor, entry)=>{
    const [node, path] = entry;
    return !isAncestorEmpty(editor, node) && getText(editor, path).trim() !== '';
};
export function getEntityInfo(data) {
    if (!data) {
        return '';
    }
    const { entityTitle, contentTypeName, entityStatus, jobs } = data;
    const title = truncateTitle(entityTitle, 60) || 'Untitled';
    const scheduledActions = jobs.length > 0 ? getScheduleTooltipContent({
        job: jobs[0],
        jobsCount: jobs.length
    }) : '';
    return `${contentTypeName || 'Asset'} "${title}", ${entityStatus} ${scheduledActions}`;
}
