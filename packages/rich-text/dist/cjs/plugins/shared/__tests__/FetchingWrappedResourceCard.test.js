"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
require("@testing-library/jest-dom/extend-expect");
const _fieldeditorreference = require("@contentful/field-editor-reference");
const _react1 = require("@testing-library/react");
const _published_content_typejson = /*#__PURE__*/ _interop_require_default(require("../__fixtures__/published_content_type.json"));
const _published_entryjson = /*#__PURE__*/ _interop_require_default(require("../__fixtures__/published_entry.json"));
const _spacejson = /*#__PURE__*/ _interop_require_default(require("../__fixtures__/space.json"));
const _FetchingWrappedResourceCard = require("../FetchingWrappedResourceCard");
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
const resolvableEntryUrn = 'crn:contentful:::content:spaces/space-id/entries/linked-entry-urn';
const unknownEntryUrn = 'crn:contentful:::content:spaces/space-id/entries/unknown-entry-urn';
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
            contentType: {
                get: jest.fn().mockReturnValue(_published_content_typejson.default)
            },
            entry: {
                get: jest.fn().mockImplementation(({ entryId })=>{
                    if (entryId === 'linked-entry-urn') {
                        return Promise.resolve(_published_entryjson.default);
                    }
                    return Promise.reject(new Error());
                })
            },
            locale: {
                getMany: jest.fn().mockResolvedValue({
                    items: [
                        {
                            default: true,
                            code: 'en'
                        }
                    ]
                })
            },
            scheduledAction: {
                getMany: jest.fn().mockResolvedValue({
                    items: [],
                    total: 0
                })
            },
            space: {
                get: jest.fn().mockResolvedValue(_spacejson.default)
            }
        },
        space: {
            onEntityChanged: jest.fn()
        },
        navigator: {},
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
function renderResourceCard({ linkType = 'Contentful:Entry', entryUrn = resolvableEntryUrn } = {}) {
    return (0, _react1.render)(/*#__PURE__*/ _react.createElement(_fieldeditorreference.EntityProvider, {
        sdk: sdk
    }, /*#__PURE__*/ _react.createElement(_FetchingWrappedResourceCard.FetchingWrappedResourceCard, {
        isDisabled: false,
        isSelected: false,
        sdk: sdk,
        link: {
            type: 'ResourceLink',
            linkType: linkType,
            urn: entryUrn
        }
    })));
}
test('renders entry card', async ()=>{
    const { getByTestId, getByText } = renderResourceCard();
    await (0, _react1.waitFor)(()=>expect(getByTestId('cf-ui-entry-card')).toBeDefined());
    expect(getByText(_published_entryjson.default.fields.exField.en)).toBeDefined();
    expect(getByText(_spacejson.default.name)).toBeDefined();
});
test('renders skeleton when no data is provided', ()=>{
    const { getByTestId } = renderResourceCard();
    expect(getByTestId('cf-ui-skeleton-form')).toBeDefined();
});
test('renders unsupported entity card when unsupported link is passed', async ()=>{
    const { getByText } = renderResourceCard({
        linkType: 'Contentful:UnsupportedLink'
    });
    await (0, _react1.waitFor)(()=>expect(getByText('Unsupported API information')).toBeDefined());
});
test('renders missing entity card when unknown error is returned', async ()=>{
    const { getByTestId } = renderResourceCard({
        entryUrn: unknownEntryUrn
    });
    await (0, _react1.waitFor)(()=>expect(getByTestId('cf-ui-missing-entity-card')).toBeDefined());
});
