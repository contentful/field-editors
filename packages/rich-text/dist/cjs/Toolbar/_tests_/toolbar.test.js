"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _richtexttypes = require("@contentful/rich-text-types");
const _react1 = require("@testing-library/react");
const _platecommon = require("@udecode/plate-common");
require("@testing-library/jest-dom/extend-expect");
const _ContentfulEditorProvider = require("../../ContentfulEditorProvider");
const _SdkProvider = require("../../SdkProvider");
const _index = /*#__PURE__*/ _interop_require_default(require("../index"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
(0, _react1.configure)({
    testIdAttribute: 'data-test-id'
});
const mockSdk = (marks)=>{
    return {
        locales: {
            default: 'en-US'
        },
        entry: {
            getSys: jest.fn().mockReturnValue({
                id: 'entry-id'
            })
        },
        field: {
            id: 'field-id',
            locale: 'en-US',
            validations: [
                {
                    enabledMarks: marks || Object.values(_richtexttypes.MARKS)
                }
            ]
        },
        access: {
            can: jest.fn().mockResolvedValue(true)
        },
        parameters: {
            instance: {
                activeLocales: []
            }
        }
    };
};
describe('Toolbar', ()=>{
    test('everything on the toolbar should be disabled', async ()=>{
        const sdk = mockSdk();
        const id = (0, _ContentfulEditorProvider.getContentfulEditorId)(sdk);
        const { getByTestId } = (0, _react1.render)(/*#__PURE__*/ _react.createElement(_platecommon.Plate, {
            id: id
        }, /*#__PURE__*/ _react.createElement(_SdkProvider.SdkProvider, {
            sdk: sdk
        }, /*#__PURE__*/ _react.createElement(_ContentfulEditorProvider.ContentfulEditorIdProvider, {
            value: id
        }, /*#__PURE__*/ _react.createElement(_index.default, {
            isDisabled: true
        })))));
        await (0, _react1.waitFor)(()=>{
            expect(getByTestId('toolbar-heading-toggle')).toBeDisabled();
            [
                _richtexttypes.MARKS.BOLD,
                _richtexttypes.MARKS.ITALIC,
                _richtexttypes.MARKS.UNDERLINE,
                'dropdown',
                'hyperlink',
                'quote',
                'ul',
                'ol',
                'hr',
                'table'
            ].forEach((s)=>expect(getByTestId(`${s}-toolbar-button`)).toBeDisabled());
            expect(getByTestId('toolbar-entity-dropdown-toggle')).toBeDisabled();
        });
    });
    describe('Dropdown', ()=>{
        it('always shows whenever at least bold, italic and underline are available', ()=>{
            const sdk = mockSdk([
                _richtexttypes.MARKS.BOLD,
                _richtexttypes.MARKS.ITALIC,
                _richtexttypes.MARKS.SUPERSCRIPT
            ]);
            const id = (0, _ContentfulEditorProvider.getContentfulEditorId)(sdk);
            const { queryByTestId } = (0, _react1.render)(/*#__PURE__*/ _react.createElement(_platecommon.Plate, {
                id: id
            }, /*#__PURE__*/ _react.createElement(_SdkProvider.SdkProvider, {
                sdk: sdk
            }, /*#__PURE__*/ _react.createElement(_ContentfulEditorProvider.ContentfulEditorIdProvider, {
                value: id
            }, /*#__PURE__*/ _react.createElement(_index.default, {
                isDisabled: true
            })))));
            expect(queryByTestId('dropdown-toolbar-button')).toBeVisible();
        });
        it('does not show if bold, italic and underline are not available', ()=>{
            const sdk = mockSdk([
                _richtexttypes.MARKS.SUPERSCRIPT,
                _richtexttypes.MARKS.SUBSCRIPT,
                _richtexttypes.MARKS.CODE
            ]);
            const id = (0, _ContentfulEditorProvider.getContentfulEditorId)(sdk);
            const { queryByTestId } = (0, _react1.render)(/*#__PURE__*/ _react.createElement(_platecommon.Plate, {
                id: id
            }, /*#__PURE__*/ _react.createElement(_SdkProvider.SdkProvider, {
                sdk: sdk
            }, /*#__PURE__*/ _react.createElement(_ContentfulEditorProvider.ContentfulEditorIdProvider, {
                value: id
            }, /*#__PURE__*/ _react.createElement(_index.default, {
                isDisabled: true
            })))));
            expect(queryByTestId('dropdown-toolbar-button')).not.toBeInTheDocument();
        });
    });
});
