"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _fieldeditorreference = require("@contentful/field-editor-reference");
require("@testing-library/jest-dom/extend-expect");
const _react1 = require("@testing-library/react");
const _published_content_typejson = /*#__PURE__*/ _interop_require_default(require("../__fixtures__/published_content_type.json"));
const _published_entryjson = /*#__PURE__*/ _interop_require_default(require("../__fixtures__/published_entry.json"));
const _FetchingWrappedEntryCard = require("../FetchingWrappedEntryCard");
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
let sdk;
beforeEach(()=>{
    sdk = {
        locales: {
            default: 'en-US',
            available: [
                'en-US'
            ],
            names: {
                'en-US': 'English (United States)'
            }
        },
        cma: {
            entry: {
                get: jest.fn().mockResolvedValue(_published_entryjson.default)
            },
            scheduledAction: {
                getMany: jest.fn().mockResolvedValue({
                    items: [],
                    total: 0
                })
            }
        },
        space: {
            getEntityScheduledActions: jest.fn().mockResolvedValue([]),
            getCachedContentTypes: jest.fn().mockReturnValue([
                _published_content_typejson.default
            ])
        },
        navigator: {
            onSlideInNavigation: jest.fn()
        },
        ids: {
            space: 'space-id',
            environment: 'environment-id'
        },
        parameters: {
            instance: {}
        },
        field: {
            localized: false
        }
    };
});
test('some dropdown actions should be disabled/removed', async ()=>{
    const { getByTestId, queryByTestId } = (0, _react1.render)(/*#__PURE__*/ _react.createElement(_fieldeditorreference.EntityProvider, {
        sdk: sdk
    }, /*#__PURE__*/ _react.createElement(_FetchingWrappedEntryCard.FetchingWrappedEntryCard, {
        sdk: sdk,
        entryId: "entry-id",
        locale: "en-US",
        onEdit: ()=>{},
        onRemove: ()=>{},
        isDisabled: true,
        isSelected: true
    })));
    await (0, _react1.waitFor)(()=>expect(getByTestId('title').textContent).toBe('The best article ever'));
    _react1.fireEvent.click(getByTestId('cf-ui-card-actions'));
    await (0, _react1.waitFor)(()=>{
        expect(getByTestId('edit')).not.toBeDisabled();
        expect(queryByTestId('delete')).toBeNull();
    });
});
