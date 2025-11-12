"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createDeserializeDocxPlugin", {
    enumerable: true,
    get: function() {
        return createDeserializeDocxPlugin;
    }
});
const _platecommon = require("@udecode/plate-common");
const _plateserializerdocx = require("@udecode/plate-serializer-docx");
const _cleanHtmlEmptyElements = require("./cleanHtmlEmptyElements");
const createDeserializeDocxPlugin = ()=>(0, _plateserializerdocx.createDeserializeDocxPlugin)({
        inject: {
            pluginsByKey: {
                [_platecommon.KEY_DESERIALIZE_HTML]: {
                    editor: {
                        insertData: {
                            transformData: (data, { dataTransfer })=>{
                                const rtf = dataTransfer.getData('text/rtf');
                                const document = new DOMParser().parseFromString((0, _platecommon.preCleanHtml)(data), 'text/html');
                                const { body } = document;
                                if (!rtf && !(0, _plateserializerdocx.isDocxContent)(body)) {
                                    return data;
                                }
                                (0, _plateserializerdocx.cleanDocxFootnotes)(body);
                                (0, _plateserializerdocx.cleanDocxImageElements)(document, rtf, body);
                                (0, _cleanHtmlEmptyElements.cleanHtmlEmptyElements)(body);
                                (0, _plateserializerdocx.cleanDocxEmptyParagraphs)(body);
                                (0, _plateserializerdocx.cleanDocxQuotes)(body);
                                (0, _plateserializerdocx.cleanDocxSpans)(body);
                                (0, _platecommon.cleanHtmlTextNodes)(body);
                                (0, _plateserializerdocx.cleanDocxBrComments)(body);
                                (0, _platecommon.cleanHtmlBrElements)(body);
                                (0, _platecommon.cleanHtmlLinkElements)(body);
                                (0, _platecommon.cleanHtmlFontElements)(body);
                                (0, _plateserializerdocx.cleanDocxListElements)(body);
                                (0, _platecommon.copyBlockMarksToSpanChild)(body);
                                return (0, _platecommon.postCleanHtml)(body.innerHTML);
                            }
                        }
                    }
                }
            }
        }
    });
