import React, { useCallback, useState, useEffect } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { EntityProvider } from '@contentful/field-editor-reference';
import { FieldConnector } from '@contentful/field-editor-shared';
import * as Contentful from '@contentful/rich-text-types';
import { Plate, getPlateActions } from '@udecode/plate-core';
import { css, cx } from 'emotion';
import deepEquals from 'fast-deep-equal';
import noop from 'lodash/noop';

import { ContentfulEditorIdProvider, getContentfulEditorId } from './ContentfulEditorProvider';
import { getPlateSelectors } from './internal/misc';
import { getPlugins, disableCorePlugins } from './plugins';
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
  value?: Contentful.Document;
  isDisabled?: boolean;
  onChange?: (doc: Contentful.Document) => unknown;
  isToolbarHidden?: boolean;
  actionsDisabled?: boolean;
  restrictedMarks?: string[];
};

export const ConnectedRichTextEditor = (props: ConnectedProps) => {
  const id = getContentfulEditorId(props.sdk);
  const plugins = React.useMemo(
    () => getPlugins(props.sdk, props.onAction ?? noop, props.restrictedMarks),
    [props.sdk, props.onAction, props.restrictedMarks]
  );

  const [isFirstRender, setIsFirstRender] = useState(true);
  const [pendingExternalUpdate, setPendingExternalUpdate] = useState(false);

  const onValueChanged = useOnValueChanged({
    editorId: id,
    handler: props.onChange,
    skip: pendingExternalUpdate || isFirstRender,
    onSkip: () => setPendingExternalUpdate(false),
  });

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
    const editor = getPlateSelectors(id).editor();
    if (!editor) {
      return;
    }
    setPendingExternalUpdate(true);
    setEditorContent(editor, documentToEditorValue(props.value));
  }, [props.value, id]);

  const classNames = cx(
    styles.editor,
    props.minHeight !== undefined ? css({ minHeight: props.minHeight }) : undefined,
    props.isDisabled ? styles.disabled : styles.enabled,
    props.isToolbarHidden && styles.hiddenToolbar
  );

  useEffect(() => {
    if (!isFirstRender) {
      return;
    }

    getPlateActions(id).value(
      normalizeEditorValue(documentToEditorValue(props.value), {
        // FIXME: fix types here
        // @ts-expect-error
        plugins,
        disableCorePlugins,
      })
    );
  }, [isFirstRender, plugins, id, props.value]);

  return (
    <SdkProvider sdk={props.sdk}>
      <ContentfulEditorIdProvider value={id}>
        <div className={styles.root} data-test-id="rich-text-editor">
          <Plate
            id={id}
            plugins={plugins}
            disableCorePlugins={disableCorePlugins}
            editableProps={{
              className: classNames,
              readOnly: props.isDisabled,
            }}
            onChange={onValueChanged}
            firstChildren={
              !props.isToolbarHidden && (
                <StickyToolbarWrapper isDisabled={props.isDisabled}>
                  <Toolbar isDisabled={props.isDisabled} />
                </StickyToolbarWrapper>
              )
            }
          />
        </div>
      </ContentfulEditorIdProvider>
    </SdkProvider>
  );
};

type Props = ConnectedProps & { isInitiallyDisabled: boolean };

const RichTextEditor = (props: Props) => {
  const { sdk, isInitiallyDisabled, onAction, restrictedMarks, ...otherProps } = props;
  const isEmptyValue = useCallback(
    (value) => !value || deepEquals(value, Contentful.EMPTY_DOCUMENT),
    []
  );

  const id = getContentfulEditorId(props.sdk);
  return (
    <EntityProvider sdk={sdk}>
      <FieldConnector
        throttle={0}
        field={sdk.field}
        isInitiallyDisabled={isInitiallyDisabled}
        isEmptyValue={isEmptyValue}
        isEqualValues={deepEquals}
      >
        {({ lastRemoteValue, disabled, setValue }) => (
          <ConnectedRichTextEditor
            {...otherProps}
            key={`rich-text-editor-${id}`}
            value={lastRemoteValue}
            sdk={sdk}
            onAction={onAction}
            isDisabled={disabled}
            onChange={setValue}
            restrictedMarks={restrictedMarks}
          />
        )}
      </FieldConnector>
    </EntityProvider>
  );
};

export default RichTextEditor;
