import React, { useCallback, useState } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { toContentfulDocument, toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import { EntityProvider } from '@contentful/field-editor-reference';
import { FieldConnector } from '@contentful/field-editor-shared';
import * as Contentful from '@contentful/rich-text-types';
import { Plate, PlateProps } from '@udecode/plate-core';
import { css, cx } from 'emotion';
import deepEquals from 'fast-deep-equal';
import debounce from 'lodash/debounce';
import noop from 'lodash/noop';
import { Editor } from 'slate';

import schema from './constants/Schema';
import {
  ContentfulEditorProvider,
  getContentfulEditorId,
  useContentfulEditor,
} from './ContentfulEditorProvider';
import { sanitizeIncomingSlateDoc } from './helpers/sanitizeSlateDoc';
import { disableCorePlugins, getPlugins } from './plugins';
import { styles } from './RichTextEditor.styles';
import { SdkProvider } from './SdkProvider';
import Toolbar from './Toolbar';
import StickyToolbarWrapper from './Toolbar/components/StickyToolbarWrapper';
import {
  RichTextTrackingActionHandler,
  TrackingProvider,
  useTrackingContext,
} from './TrackingProvider';
import { TextOrCustomElement } from './types';

type ConnectedProps = {
  sdk: FieldExtensionSDK;
  onAction?: RichTextTrackingActionHandler;
  minHeight?: string | number;
  value?: object;
  isDisabled?: boolean;
  onChange?: (doc: Contentful.Document) => unknown;
  isToolbarHidden?: boolean;
  actionsDisabled?: boolean;
};

export const ConnectedRichTextEditor = (props: ConnectedProps) => {
  const tracking = useTrackingContext();

  const editor = useContentfulEditor();

  const [value, setValue] = useState<PlateProps['value']>([]);

  const classNames = cx(
    styles.editor,
    props.minHeight !== undefined ? css({ minHeight: props.minHeight }) : undefined,
    props.isDisabled ? styles.disabled : styles.enabled,
    props.isToolbarHidden && styles.hiddenToolbar
  );

  const plugins = React.useMemo(() => getPlugins(props.sdk, tracking), [props.sdk, tracking]);

  React.useEffect(() => {
    if (!editor) {
      return;
    }

    const docFromAdapter = toSlatejsDocument({
      document: props.value || Contentful.EMPTY_DOCUMENT,
      schema,
    });
    const doc = sanitizeIncomingSlateDoc(docFromAdapter);

    // Slate throws an error if the value on the initial render is invalid
    // so we directly set the value on the editor in order
    // to be able to trigger normalization on the initial value before rendering
    // TODO: use https://plate.udecode.io/docs/Plate#normalizeinitialvalue when working
    editor.children = doc;
    Editor.normalize(editor, { force: true });
    // We set the value so that the rendering can take over from here
    setValue(editor.children);
  }, [props.value, editor]);

  const onChangeHandler = debounce(
    (slateDoc) => {
      setValue(slateDoc as TextOrCustomElement[]);
      const contentfulDoc = toContentfulDocument({ document: slateDoc, schema });
      props.onChange?.(contentfulDoc);
    },
    1000,
    { trailing: true }
  );

  return (
    <div className={styles.root} data-test-id="rich-text-editor">
      <Plate
        id={getContentfulEditorId(props.sdk)}
        value={value}
        plugins={plugins}
        disableCorePlugins={disableCorePlugins}
        editableProps={{
          className: classNames,
          readOnly: props.isDisabled,
        }}
        onChange={(doc) => {
          if (editor.operations.at(-1)?.type === 'set_selection') {
            return;
          }
          console.log('change')
          onChangeHandler(doc);
        }}>
        {!props.isToolbarHidden && (
          <StickyToolbarWrapper isDisabled={props.isDisabled}>
            <Toolbar isDisabled={props.isDisabled} />
          </StickyToolbarWrapper>
        )}
      </Plate>
    </div>
  );
};

type Props = ConnectedProps & { isInitiallyDisabled: boolean };

const RichTextEditor = (props: Props) => {
  const { sdk, isInitiallyDisabled, onAction, ...otherProps } = props;
  const isEmptyValue = useCallback(
    (value) => !value || deepEquals(value, Contentful.EMPTY_DOCUMENT),
    []
  );
  return (
    <EntityProvider sdk={sdk}>
      <SdkProvider sdk={sdk}>
        <TrackingProvider onAction={onAction || noop}>
          <FieldConnector
            throttle={0}
            field={sdk.field}
            isInitiallyDisabled={isInitiallyDisabled}
            isEmptyValue={isEmptyValue}
            isEqualValues={deepEquals}>
            {({ lastRemoteValue, disabled, setValue, externalReset }) => (
              <ContentfulEditorProvider sdk={sdk}>
                <ConnectedRichTextEditor
                  {...otherProps}
                  key={`rich-text-editor-${externalReset}`}
                  value={lastRemoteValue}
                  sdk={sdk}
                  onAction={onAction || noop}
                  isDisabled={disabled}
                  onChange={setValue}
                />
              </ContentfulEditorProvider>
            )}
          </FieldConnector>
        </TrackingProvider>
      </SdkProvider>
    </EntityProvider>
  );
};

export default RichTextEditor;
