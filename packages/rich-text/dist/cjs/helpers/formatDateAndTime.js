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
    formatDate: function() {
        return formatDate;
    },
    formatDateAndTime: function() {
        return formatDateAndTime;
    },
    formatTime: function() {
        return formatTime;
    }
});
const _moment = /*#__PURE__*/ _interop_require_default(require("moment"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const formatDate = (date, short)=>{
    switch((0, _moment.default)().startOf('day').diff((0, _moment.default)(date).startOf('day'), 'days')){
        case 0:
            return short ? 'Today' : `Today, ${(0, _moment.default)(date).format('DD MMM YYYY')}`;
        case -1:
            return short ? 'Tomorrow' : `Tomorrow, ${(0, _moment.default)(date).format('DD MMM YYYY')}`;
        case 1:
            return short ? 'Yesterday' : `Yesterday, ${(0, _moment.default)(date).format('DD MMM YYYY')}`;
        default:
            return (0, _moment.default)(date).format('ddd, DD MMM YYYY');
    }
};
const formatTime = (date)=>{
    return _moment.default.utc(date).local().format('h:mm A');
};
const formatDateAndTime = (date, short)=>{
    return `${formatDate(date, short)} at ${formatTime(date)}`;
};
