import * as React from 'react';
import { INLINES } from '@contentful/rich-text-types';
import isHotkey from 'is-hotkey';
import { isLinkActive, unwrapLink } from '../../helpers/editor';
import { transformRemove } from '../../helpers/transformers';
import { EntityHyperlink } from './components/EntityHyperlink';
import { ResourceHyperlink } from './components/ResourceHyperlink';
import { UrlHyperlink } from './components/UrlHyperlink';
import { addOrEditLink } from './HyperlinkModal';
import { hasText } from './utils';
const isAnchor = (element)=>element.nodeName === 'A' && !!element.getAttribute('href') && element.getAttribute('href') !== '#';
const isEntryAnchor = (element)=>element.nodeName === 'A' && element.getAttribute('data-link-type') === 'Entry';
const isAssetAnchor = (element)=>element.nodeName === 'A' && element.getAttribute('data-link-type') === 'Asset';
const isResourceAnchor = (element)=>element.nodeName === 'A' && element.getAttribute('data-resource-link-type') === 'Contentful:Entry';
const buildHyperlinkEventHandler = (sdk)=>(editor, { options: { hotkey } })=>{
        return (event)=>{
            if (!editor.selection) {
                return;
            }
            if (hotkey && !isHotkey(hotkey, event)) {
                return;
            }
            if (isLinkActive(editor)) {
                unwrapLink(editor);
                editor.tracking.onShortcutAction('unlinkHyperlinks');
            } else {
                addOrEditLink(editor, sdk, editor.tracking.onShortcutAction);
            }
        };
    };
const getNodeOfType = (type)=>(el, node)=>({
            type,
            children: node.children,
            data: type === INLINES.HYPERLINK ? {
                uri: el.getAttribute('href')
            } : type === INLINES.RESOURCE_HYPERLINK ? {
                target: {
                    sys: {
                        urn: el.getAttribute('data-resource-link-urn'),
                        linkType: el.getAttribute('data-resource-link-type'),
                        type: 'ResourceLink'
                    }
                }
            } : {
                target: {
                    sys: {
                        id: el.getAttribute('data-link-id'),
                        linkType: el.getAttribute('data-link-type'),
                        type: 'Link'
                    }
                }
            }
        });
export const createHyperlinkPlugin = (sdk)=>{
    const common = {
        isElement: true,
        isInline: true
    };
    return {
        key: 'HyperlinkPlugin',
        options: {
            hotkey: 'mod+k'
        },
        handlers: {
            onKeyDown: buildHyperlinkEventHandler(sdk)
        },
        plugins: [
            {
                ...common,
                key: INLINES.HYPERLINK,
                type: INLINES.HYPERLINK,
                component: UrlHyperlink,
                deserializeHtml: {
                    rules: [
                        {
                            validNodeName: [
                                'A'
                            ]
                        }
                    ],
                    query: (el)=>isAnchor(el) && !(isEntryAnchor(el) || isAssetAnchor(el)),
                    getNode: getNodeOfType(INLINES.HYPERLINK)
                }
            },
            {
                ...common,
                key: INLINES.ENTRY_HYPERLINK,
                type: INLINES.ENTRY_HYPERLINK,
                component: EntityHyperlink,
                deserializeHtml: {
                    rules: [
                        {
                            validNodeName: [
                                'A'
                            ]
                        }
                    ],
                    query: (el)=>isEntryAnchor(el),
                    getNode: getNodeOfType(INLINES.ENTRY_HYPERLINK)
                }
            },
            {
                ...common,
                key: INLINES.RESOURCE_HYPERLINK,
                type: INLINES.RESOURCE_HYPERLINK,
                component: ResourceHyperlink,
                deserializeHtml: {
                    rules: [
                        {
                            validNodeName: [
                                'A'
                            ]
                        }
                    ],
                    query: (el)=>isResourceAnchor(el),
                    getNode: getNodeOfType(INLINES.RESOURCE_HYPERLINK)
                }
            },
            {
                ...common,
                key: INLINES.ASSET_HYPERLINK,
                type: INLINES.ASSET_HYPERLINK,
                component: EntityHyperlink,
                deserializeHtml: {
                    rules: [
                        {
                            validNodeName: [
                                'A'
                            ]
                        }
                    ],
                    query: (el)=>isAssetAnchor(el),
                    getNode: getNodeOfType(INLINES.ASSET_HYPERLINK)
                }
            }
        ],
        normalizer: [
            {
                match: {
                    type: [
                        INLINES.HYPERLINK,
                        INLINES.ASSET_HYPERLINK,
                        INLINES.ENTRY_HYPERLINK,
                        INLINES.RESOURCE_HYPERLINK
                    ]
                },
                validNode: hasText,
                transform: transformRemove
            }
        ]
    };
};
