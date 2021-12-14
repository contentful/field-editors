import React, { useCallback, useState } from 'react';
import noop from 'lodash/noop';
import { toContentfulDocument, toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import * as Contentful from '@contentful/rich-text-types';
import { EntityProvider } from '@contentful/field-editor-reference';
import { css, cx } from 'emotion';
import { styles } from './RichTextEditor.styles';
import schema from './constants/Schema';
import deepEquals from 'fast-deep-equal';
import Toolbar from './Toolbar';
import StickyToolbarWrapper from './Toolbar/StickyToolbarWrapper';
import { Plate } from '@udecode/plate-core';
import { SdkProvider } from './SdkProvider';
import {
  RichTextTrackingActionHandler,
  TrackingProvider,
  useTrackingContext,
} from './TrackingProvider';
import { sanitizeIncomingSlateDoc, sanitizeSlateDoc } from './helpers/sanitizeSlateDoc';
import { TextOrCustomElement } from './types';
import { ContentfulEditorProvider, getContentfulEditorId } from './ContentfulEditorProvider';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { FieldConnector } from '@contentful/field-editor-shared';
import { getPlugins, pluginOptions } from './plugins';

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

  const docFromAdapter = toSlatejsDocument({
    document: props.value || Contentful.EMPTY_DOCUMENT,
    schema,
  });

  const doc = sanitizeIncomingSlateDoc(docFromAdapter);

  const [value, setValue] = useState(doc);

  const classNames = cx(
    styles.editor,
    props.minHeight !== undefined ? css({ minHeight: props.minHeight }) : undefined,
    props.isDisabled ? styles.disabled : styles.enabled,
    props.isToolbarHidden && styles.hiddenToolbar
  );

  const plugins = React.useMemo(() => getPlugins(props.sdk, tracking), [props.sdk, tracking]);

  return (
    <div className={styles.root} data-test-id="rich-text-editor">
      <Plate
        id={getContentfulEditorId(props.sdk)}
        initialValue={value}
        plugins={plugins}
        editableProps={{
          className: classNames,
          readOnly: props.isDisabled,
        }}
        onChange={(newValue) => {
          const slateDoc = sanitizeSlateDoc(newValue as TextOrCustomElement[]);
          setValue(slateDoc);
          const contentfulDoc = toContentfulDocument({ document: slateDoc, schema });
          props.onChange?.(contentfulDoc);
        }}
        // @ts-expect-error
        options={pluginOptions}>
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
