import React, { useCallback, useState, useEffect } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { EntityProvider } from '@contentful/field-editor-reference';
import { FieldConnector } from '@contentful/field-editor-shared';
import * as Contentful from '@contentful/rich-text-types';
import { Plate, PlateProvider } from '@udecode/plate-common';
import { css, cx } from 'emotion';
import deepEquals from 'fast-deep-equal';
import noop from 'lodash/noop';

import { ContentfulEditorIdProvider, getContentfulEditorId } from './ContentfulEditorProvider';
import { usePlateSelectors, usePlateActions } from './internal/hooks';
import { PlateEditor, Value, PlatePlugin } from './internal/types';
import { getPlugins } from './plugins';
import { RichTextTrackingActionHandler } from './plugins/Tracking';
import { documentToEditorValue, normalizeEditorValue, setEditorContent } from './prepareDocument';
import { styles } from './RichTextEditor.styles';
import { SdkProvider } from './SdkProvider';
import Toolbar from './Toolbar';
import StickyToolbarWrapper from './Toolbar/components/StickyToolbarWrapper';
import { useOnValueChanged } from './useOnValueChanged';

type ConnectedProps = {
  sdk: FieldExtensionSDK;
  onAction?: RichTextTrackingActionHandler;
  minHeight?: string | number;
  value?: object;
  isDisabled?: boolean;
  onChange?: (doc: Contentful.Document) => unknown;
  isToolbarHidden?: boolean;
  actionsDisabled?: boolean;
  restrictedMarks?: string[];
  plugins?: PlatePlugin[];
};

export const ConnectedRichTextEditor = (
  props: ConnectedProps & {
    setIsFirstRender: React.Dispatch<React.SetStateAction<boolean>>;
    setPendingExternalUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  }
) => {
  const {
    sdk,
    minHeight,
    isDisabled,
    isToolbarHidden,
    value,
    plugins,
    setIsFirstRender,
    setPendingExternalUpdate,
  } = props;
  const id = getContentfulEditorId(sdk);
  const classNames = cx(
    styles.editor,
    minHeight !== undefined ? css({ minHeight: minHeight }) : undefined,
    isDisabled ? styles.disabled : styles.enabled,
    isToolbarHidden && styles.hiddenToolbar
  );

  const editor = usePlateSelectors(id).editor();

  // TODO: double check this
  usePlateActions(id).value(
    normalizeEditorValue(documentToEditorValue(value as Contentful.Document) as Value, {
      plugins: plugins,
    })
  );

  useEffect(() => {
    /*
      This effect is called when the value prop changes. Normally
      this happens when the value is changed outside of the editor,
      like in snapshots restoration or remote updates
      Plate won't update the displayed value on its own, see:
       - https://github.com/ianstormtaylor/slate/pull/4540
       - https://github.com/udecode/plate/issues/1169

       The content is forcefully set to the new value and it's ensured
       the change listener isn't invoked
    */
    setIsFirstRender(false);
    if (!editor) {
      return;
    }
    setPendingExternalUpdate(true);
    setEditorContent(editor, documentToEditorValue(value as Contentful.Document));
  }, [value, id, editor, setIsFirstRender, setPendingExternalUpdate]);

  return (
    <SdkProvider sdk={sdk}>
      <ContentfulEditorIdProvider value={id}>
        <div className={styles.root} data-test-id="rich-text-editor">
          <Plate<Value, PlateEditor>
            id={id}
            editableProps={{
              className: classNames,
              readOnly: isDisabled,
            }}
            firstChildren={
              !isToolbarHidden && (
                <StickyToolbarWrapper isDisabled={isDisabled}>
                  <Toolbar isDisabled={isDisabled} />
                </StickyToolbarWrapper>
              )
            }
          />
        </div>
      </ContentfulEditorIdProvider>
    </SdkProvider>
  );
};

export const ConnectedRichTextEditorWithProvider = (
  props: ConnectedProps & {
    disabled?: boolean;
    lastRemoteValue: any;
    setValue: any;
  }
) => {
  const { sdk, onAction, disabled, restrictedMarks, lastRemoteValue, setValue, ...otherProps } =
    props;
  const id = getContentfulEditorId(props.sdk);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [pendingExternalUpdate, setPendingExternalUpdate] = useState(false);
  const plugins = React.useMemo(
    () => getPlugins(props.sdk, props.onAction ?? noop, props.restrictedMarks),
    [props.sdk, props.onAction, props.restrictedMarks]
  );
  const onValueChanged = useOnValueChanged({
    editorId: id,
    handler: setValue,
    skip: pendingExternalUpdate || isFirstRender,
    onSkip: () => setPendingExternalUpdate(false),
  });

  return (
    <PlateProvider<Value, PlateEditor> id={id} plugins={plugins} onChange={onValueChanged}>
      <ConnectedRichTextEditor
        {...otherProps}
        key={`rich-text-editor-${id}`}
        value={lastRemoteValue}
        sdk={sdk}
        onAction={onAction}
        isDisabled={disabled}
        restrictedMarks={restrictedMarks}
        plugins={plugins}
        setIsFirstRender={setIsFirstRender}
        setPendingExternalUpdate={setPendingExternalUpdate}
      />
    </PlateProvider>
  );
};

type Props = ConnectedProps & { isInitiallyDisabled: boolean };

const RichTextEditor = (props: Props) => {
  const { sdk, isInitiallyDisabled } = props;
  const isEmptyValue = useCallback(
    (value) => !value || deepEquals(value, Contentful.EMPTY_DOCUMENT),
    []
  );

  return (
    <EntityProvider sdk={sdk}>
      <FieldConnector
        throttle={0}
        field={sdk.field}
        isInitiallyDisabled={isInitiallyDisabled}
        isEmptyValue={isEmptyValue}
        isEqualValues={deepEquals}
      >
        {({ lastRemoteValue, disabled, setValue }) => {
          return (
            <ConnectedRichTextEditorWithProvider
              lastRemoteValue={lastRemoteValue}
              disabled={disabled}
              setValue={setValue}
              {...props}
            />
          );
        }}
      </FieldConnector>
    </EntityProvider>
  );
};

export default RichTextEditor;
