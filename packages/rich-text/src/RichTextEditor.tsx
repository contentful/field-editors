import React, { useCallback, useEffect } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { EntityProvider } from '@contentful/field-editor-reference';
import { FieldConnector } from '@contentful/field-editor-shared';
import * as Contentful from '@contentful/rich-text-types';
import { Plate, getPlateActions } from '@udecode/plate-core';
import { css, cx } from 'emotion';
import deepEquals from 'fast-deep-equal';
import noop from 'lodash/noop';

import {
  ContentfulEditorIdProvider,
  getContentfulEditorId,
  useContentfulEditor,
  useContentfulEditorId,
} from './ContentfulEditorProvider';
import { getPlugins, disableCorePlugins } from './plugins';
import { RichTextTrackingActionHandler } from './plugins/Tracking';
import { styles } from './RichTextEditor.styles';
import { SdkProvider } from './SdkProvider';
import Toolbar from './Toolbar';
import StickyToolbarWrapper from './Toolbar/components/StickyToolbarWrapper';
import { useNormalizedSlateValue } from './useNormalizedSlateValue';
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
};

export const ConnectedRichTextEditor = (props: ConnectedProps) => {
  const id = useContentfulEditorId();
  const editor = useContentfulEditor();

  const plugins = React.useMemo(
    () => getPlugins(props.sdk, props.onAction ?? noop),
    [props.sdk, props.onAction]
  );

  const initialValue = useNormalizedSlateValue({
    id,
    incomingDoc: props.value,
    plugins,
  });

  const onValueChanged = useOnValueChanged({
    editor,
    handler: props.onChange,
  });

  const classNames = cx(
    styles.editor,
    props.minHeight !== undefined ? css({ minHeight: props.minHeight }) : undefined,
    props.isDisabled ? styles.disabled : styles.enabled,
    props.isToolbarHidden && styles.hiddenToolbar
  );

  useEffect(() => {
    // Ensure the plate state is cleared after the component unmounts
    // This prevent new editors for the same field to display old outdated values
    // Typical scenario: coming back to the entry editor after restoring a previous entry version
    getPlateActions(id).enabled(true);
    return () => getPlateActions(id).enabled(false);
  }, [id]);

  return (
    <div className={styles.root} data-test-id="rich-text-editor">
      <Plate
        id={id}
        initialValue={initialValue}
        plugins={plugins}
        disableCorePlugins={disableCorePlugins}
        editableProps={{
          className: classNames,
          readOnly: props.isDisabled,
        }}
        onChange={onValueChanged}>
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

  const editorId = getContentfulEditorId(sdk);

  return (
    <EntityProvider sdk={sdk}>
      <SdkProvider sdk={sdk}>
        <FieldConnector
          throttle={0}
          field={sdk.field}
          isInitiallyDisabled={isInitiallyDisabled}
          isEmptyValue={isEmptyValue}
          isEqualValues={deepEquals}>
          {({ lastRemoteValue, disabled, setValue, externalReset }) => (
            <ContentfulEditorIdProvider value={editorId}>
              <ConnectedRichTextEditor
                {...otherProps}
                key={`rich-text-editor-${externalReset}`}
                value={lastRemoteValue}
                sdk={sdk}
                onAction={onAction}
                isDisabled={disabled}
                onChange={setValue}
              />
            </ContentfulEditorIdProvider>
          )}
        </FieldConnector>
      </SdkProvider>
    </EntityProvider>
  );
};

export default RichTextEditor;
