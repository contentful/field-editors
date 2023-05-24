/* eslint-disable jsx-a11y/no-static-element-interactions */
import * as React from 'react';
import { useMemo } from 'react';

import { FieldAPI, FieldExtensionSDK } from '@contentful/app-sdk';
import {
  createFakeFieldAPI,
  ActionsPlayground,
  createFakeSpaceAPI,
  createFakeLocalesAPI,
  createFakeNavigatorAPI,
  createFakeCMAAdapter,
} from '@contentful/field-editor-test-utils';
import { ValidationErrors } from '@contentful/field-editor-validation-errors';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { MARKS } from '@contentful/rich-text-types';
import type { Meta, StoryObj } from '@storybook/react';
import { css } from 'emotion';

import { assets, entries } from '../src/__fixtures__/fixtures';
import RichTextEditor from '../src/RichTextEditor';
import { validateRichTextDocument } from '../src/test-utils/validation';

const meta: Meta<typeof RichTextEditor> = {
  title: 'editors/RichTextEditor',
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

const DemoRichTextEditor = () => {
  window.actions = [];

  const rtPreviewStyle = css({
    backgroundColor: 'whitesmoke',
    padding: '0 0.5em',
    minHeight: '20px',
  });

  const newEntitySelectorDummyDialog = (fnName: string, type: any) => async () => {
    return confirm(`sdk.dialogs.${fnName}()\nSimulate selecting a random entity or cancel?`)
      ? {
          sys: {
            id: 'example-entity-id',
            type,
          },
        }
      : null; // Simulate cancellation.
  };

  const initialValue = JSON.parse(window.localStorage.getItem('initialValue') as any) || undefined;
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
      Entry: {
        get: () => Promise.resolve(entries.published),
      },
      Asset: {
        get: () => Promise.resolve(assets.published),
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
    <div data-test-id="rich-text-editor-integration-test">
      <RichTextEditor
        sdk={sdk as unknown as FieldExtensionSDK}
        onAction={onAction}
        isInitiallyDisabled={isDisabled as boolean}
        restrictedMarks={JSON.parse(window.localStorage.getItem('restrictedMarks') as any) || []}
      />

      <ValidationErrors field={field} locales={[] as any} />
      <ActionsPlayground mitt={mitt} renderValue={renderRT} />
    </div>
  );
};

export const Default: Story = {
  render: () => {
    return <DemoRichTextEditor />;
  },
};
