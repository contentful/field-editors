import * as React from 'react';
import { EntityProvider } from '@contentful/field-editor-reference';
import '@testing-library/jest-dom/extend-expect';
import { configure, fireEvent, render, waitFor } from '@testing-library/react';
import publishedCT from '../__fixtures__/published_content_type.json';
import publishedEntry from '../__fixtures__/published_entry.json';
import { FetchingWrappedEntryCard } from '../FetchingWrappedEntryCard';
configure({
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
                get: jest.fn().mockResolvedValue(publishedEntry)
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
                publishedCT
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
    const { getByTestId, queryByTestId } = render(/*#__PURE__*/ React.createElement(EntityProvider, {
        sdk: sdk
    }, /*#__PURE__*/ React.createElement(FetchingWrappedEntryCard, {
        sdk: sdk,
        entryId: "entry-id",
        locale: "en-US",
        onEdit: ()=>{},
        onRemove: ()=>{},
        isDisabled: true,
        isSelected: true
    })));
    await waitFor(()=>expect(getByTestId('title').textContent).toBe('The best article ever'));
    fireEvent.click(getByTestId('cf-ui-card-actions'));
    await waitFor(()=>{
        expect(getByTestId('edit')).not.toBeDisabled();
        expect(queryByTestId('delete')).toBeNull();
    });
});
