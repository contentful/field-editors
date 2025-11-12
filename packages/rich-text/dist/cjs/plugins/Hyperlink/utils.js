"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getEntityInfo: function() {
        return getEntityInfo;
    },
    hasText: function() {
        return hasText;
    }
});
const _fieldeditorreference = require("@contentful/field-editor-reference");
const _platecommon = require("@udecode/plate-common");
const _queries = require("../../internal/queries");
const _utils = require("../../plugins/shared/utils");
const hasText = (editor, entry)=>{
    const [node, path] = entry;
    return !(0, _platecommon.isAncestorEmpty)(editor, node) && (0, _queries.getText)(editor, path).trim() !== '';
};
function getEntityInfo(data) {
    if (!data) {
        return '';
    }
    const { entityTitle, contentTypeName, entityStatus, jobs } = data;
    const title = (0, _utils.truncateTitle)(entityTitle, 60) || 'Untitled';
    const scheduledActions = jobs.length > 0 ? (0, _fieldeditorreference.getScheduleTooltipContent)({
        job: jobs[0],
        jobsCount: jobs.length
    }) : '';
    return `${contentTypeName || 'Asset'} "${title}", ${entityStatus} ${scheduledActions}`;
}
