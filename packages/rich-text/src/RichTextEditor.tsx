import React, { useCallback } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { EntityProvider } from '@contentful/field-editor-reference';
import { FieldConnector } from '@contentful/field-editor-shared';
import * as Contentful from '@contentful/rich-text-types';
import { Plate } from '@udecode/plate-core';
import { css, cx } from 'emotion';
import deepEquals from 'fast-deep-equal';
import noop from 'lodash/noop';

import schema from './constants/Schema';
import { ContentfulEditorProvider, getContentfulEditorId } from './ContentfulEditorProvider';
import { getPlugins, disableCorePlugins } from './plugins';
import { styles } from './RichTextEditor.styles';
import { SdkProvider } from './SdkProvider';
import Toolbar from './Toolbar';
import StickyToolbarWrapper from './Toolbar/components/StickyToolbarWrapper';
import {
  RichTextTrackingActionHandler,
  TrackingProvider,
  useTrackingContext,
} from './TrackingProvider';
import { useNormalizedSlateValue } from './useNormalizedSlateValue';

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
  const id = getContentfulEditorId(props.sdk);

  const tracking = useTrackingContext();
  const plugins = React.useMemo(() => getPlugins(props.sdk, tracking), [props.sdk, tracking]);

  const initialValue = useNormalizedSlateValue({
    id,
    incomingDoc: props.value,
    plugins,
  });

  const classNames = cx(
    styles.editor,
    props.minHeight !== undefined ? css({ minHeight: props.minHeight }) : undefined,
    props.isDisabled ? styles.disabled : styles.enabled,
    props.isToolbarHidden && styles.hiddenToolbar
  );

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
        onChange={(document) => {
          props.onChange?.(toContentfulDocument({ document, schema }));
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
