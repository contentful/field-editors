/* eslint-disable jsx-a11y/no-static-element-interactions */
import * as React from 'react';
import { useMemo } from 'react';

import { FieldAPI, FieldAppSDK } from '@contentful/app-sdk';
import { IconButton } from '@contentful/f36-components';
import { CopyIcon } from '@contentful/f36-icons';
import {
  ActionsPlayground,
  createFakeCMAAdapter,
  createFakeFieldAPI,
  createFakeLocalesAPI,
  createFakeNavigatorAPI,
  createFakeSpaceAPI,
} from '@contentful/field-editor-test-utils';
import { ValidationErrors } from '@contentful/field-editor-validation-errors';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { MARKS } from '@contentful/rich-text-types';
import type { Meta, StoryObj } from '@storybook/react';
import { css } from 'emotion';

import { assets, contentTypes, entries, locales, spaces } from '../src/__fixtures__/fixtures';
import RichTextEditor from '../src/RichTextEditor';
import { validateRichTextDocument } from '../src/test-utils/validation';
import { RichTextPreview } from './RichTextPreview';

const meta: Meta<typeof RichTextEditor> = {
  title: 'editors/Rich Text Editor',
  component: RichTextEditor,
};

export default meta;

type Story = StoryObj<typeof RichTextEditor>;

declare global {
  interface Window {
    actions: any[];
    richTextField: FieldAPI;
  }
}

const layoutStyle = css({
  display: 'grid',
  gridTemplateColumns: '70% 1fr',
  gap: '10px',
});

const structurePreviewContainerStyle = css({
  position: 'relative',
  height: 'calc(100vh - 35px)',
  maxHeight: 700,
  overflowY: 'scroll',
});

const structurePreviewCopyButton = css({
  position: 'absolute',
  right: 0,
  top: 8,
});

const DemoRichTextEditor = () => {
  window.actions = [];

  const rtPreviewStyle = css({
    backgroundColor: 'whitesmoke',
    padding: '0 0.5em',
    minHeight: '20px',
  });

  const newEntitySelectorDummyDialog = (fnName: string, type: any) => async () => {
    // Not showing the confirm dialog when running Cypress tests
    //@ts-expect-error
    if (window.parent.Cypress) {
      return window.localStorage.getItem('shouldConfirm') === 'true'
        ? {
            sys: {
              id: 'example-entity-id',
              urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
              type,
            },
          }
        : null;
    }

    return confirm(`sdk.dialogs.${fnName}()\nSimulate selecting a random entity or cancel?`)
      ? {
          sys: {
            id: 'example-entity-id',
            urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
            type,
          },
        }
      : null; // Simulate cancellation.
  };

  const initialValue = JSON.parse(window.localStorage.getItem('initialValue') as any) || undefined;
  const [currentValue, setCurrentValue] = React.useState({});
  const fieldValidations =
    JSON.parse(window.localStorage.getItem('fieldValidations') as any) || undefined;
  const [field, mitt] = useMemo(
    () =>
      createFakeFieldAPI((mock: any) => {
        // Overriding mark validation here to show all marks if no fieldValidations set
        mock.validations = fieldValidations
          ? fieldValidations
          : [
              {
                enabledMarks: Object.values(MARKS),
              },
            ];
        return mock;
      }, initialValue),
    [fieldValidations, initialValue]
  );

  const isDisabled = window.localStorage.getItem('initialDisabled') || false;

  const space = useMemo(() => createFakeSpaceAPI(), []);
  const navigator = useMemo(() => createFakeNavigatorAPI(), []);
  const onAction = (...args: any[]) => window.actions.push(args);

  const sdk = {
    ids: {
      space: 'space-id',
      environment: 'environment-id',
    },
    cmaAdapter: createFakeCMAAdapter({
      ContentType: {
        get: () => Promise.resolve(contentTypes.published),
      },
      Entry: {
        get: () => Promise.resolve(entries.published),
      },
      Asset: {
        get: () => Promise.resolve(assets.published),
      },
      Locale: {
        getMany: () => Promise.resolve({ items: [locales.englishDefault] }),
      },
      Space: {
        get: () => Promise.resolve(spaces.indifferent),
      },
    }),
    space: {
      ...space,
      getEntityScheduledActions: () => {
        return Promise.resolve([]);
      },
      getAssets: () => {
        return Promise.resolve({ items: [assets.published] });
      },
    },
    entry: {
      ...entries.published,
      getSys: () => entries.published.sys,
    },
    field,
    locales: createFakeLocalesAPI(),
    navigator: {
      ...navigator,
      onSlideInNavigation: () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- .
        return () => {};
      },
    },
    dialogs: {
      selectSingleAsset: newEntitySelectorDummyDialog('selectSingleAsset', 'Asset'),
      selectSingleEntry: newEntitySelectorDummyDialog('selectSingleEntry', 'Entry'),
      selectSingleResourceEntry: newEntitySelectorDummyDialog(
        'selectSingleResourceEntry',
        'Contentful:Entry'
      ),
    },
    access: {
      can: (access: any, entityType: any) => {
        if (entityType === 'Asset') {
          if (access === 'create') {
            return Promise.resolve(false);
          }
          if (access === 'read') {
            return Promise.resolve(true);
          }
        }
        return Promise.resolve(false);
      },
    },
    parameters: {
      instance: {
        getEntryUrl: () => '#',
      },
    },
    events: [],
  };

  // Validate on change
  React.useEffect(() => {
    field.onValueChanged((value: any) => {
      // Don't run the previewer in cypress tests as it causes re rendering of the RichTextEditor and some brittle tests
      if (!window.location.search.includes('cypress')) {
        setCurrentValue(value);
      }

      if (!value) {
        return mitt.emit('onSchemaErrorsChanged', []);
      }

      mitt.emit('onSchemaErrorsChanged', validateRichTextDocument(value));
    });
  }, [field, mitt]);

  const renderRT = (value: any, type: any) => {
    const logValue = () => {
      console.log(type, value);
    };

    const valueString = JSON.stringify(value, null, 2);

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- .
      <div className={rtPreviewStyle} title={valueString} onClick={logValue}>
        {type === 'onSchemaErrorsChanged' ? valueString : documentToReactComponents(value)}
      </div>
    );
  };

  window.richTextField = field;

  return (
    <div className={layoutStyle}>
      <div data-test-id="rich-text-editor-integration-test">
        <RichTextEditor
          sdk={sdk as unknown as FieldAppSDK}
          onAction={onAction}
          isInitiallyDisabled={isDisabled as boolean}
          restrictedMarks={JSON.parse(window.localStorage.getItem('restrictedMarks') as any) || []}
        />

        <ValidationErrors field={field} locales={[] as any} />
        <ActionsPlayground mitt={mitt} renderValue={renderRT} />
      </div>
      <div data-test-id="rich-text-structure-preview" className={structurePreviewContainerStyle}>
        <IconButton
          variant="transparent"
          aria-label="Copy"
          icon={<CopyIcon size="tiny" variant="positive" />}
          className={structurePreviewCopyButton}
          onClick={async () => {
            // https://stackoverflow.com/a/65996386
            async function copyToClipboard(textToCopy: string | null = '') {
              // Navigator clipboard api needs a secure context (https)
              if ((navigator as any).clipboard && window.isSecureContext) {
                await (navigator as any).clipboard.writeText(textToCopy);
              } else {
                // Use the 'out of viewport hidden text area' trick
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy ?? '';

                // Move textarea out of the viewport so it's not visible
                textArea.style.position = 'absolute';
                textArea.style.left = '-999999px';

                document.body.prepend(textArea);
                textArea.select();

                try {
                  document.execCommand('copy');
                } catch (error) {
                  console.error(error);
                } finally {
                  textArea.remove();
                }
              }
              alert('Copied');
            }

            await copyToClipboard(JSON.stringify(currentValue, null, 2));
          }}
        />
        <RichTextPreview value={JSON.stringify(currentValue, null, 2)} />
      </div>
    </div>
  );
};

export const Default: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    return <DemoRichTextEditor />;
  },
};
