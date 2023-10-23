import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import { EntityProvider } from '@contentful/field-editor-reference';
import { FieldConnector } from '@contentful/field-editor-shared';
import * as Contentful from '@contentful/rich-text-types';
import { Plate, PlateProvider } from '@udecode/plate-common';
import { css, cx } from 'emotion';
import deepEquals from 'fast-deep-equal';
import noop from 'lodash/noop';

import { ContentfulEditorIdProvider, getContentfulEditorId } from './ContentfulEditorProvider';
import { toSlateValue } from './helpers/toSlateValue';
import { normalizeInitialValue } from './internal/misc';
import { getPlugins, disableCorePlugins } from './plugins';
import { RichTextTrackingActionHandler } from './plugins/Tracking';
import { styles } from './RichTextEditor.styles';
import { SdkProvider } from './SdkProvider';
import { SyncEditorChanges } from './SyncEditorChanges';
import Toolbar from './Toolbar';
import StickyToolbarWrapper from './Toolbar/components/StickyToolbarWrapper';

type ConnectedProps = {
  sdk: FieldAppSDK;
  onAction?: RichTextTrackingActionHandler;
  minHeight?: string | number;
  maxHeight?: string | number;
  value?: Contentful.Document;
  isDisabled?: boolean;
  onChange?: (doc: Contentful.Document) => unknown;
  isToolbarHidden?: boolean;
  actionsDisabled?: boolean;
  restrictedMarks?: string[];
};

export const ConnectedRichTextEditor = (props: ConnectedProps) => {
  const { sdk, onAction, restrictedMarks } = props;

  const id = getContentfulEditorId(sdk);
  const plugins = React.useMemo(
    () => getPlugins(sdk, onAction ?? noop, restrictedMarks),
    [sdk, onAction, restrictedMarks]
  );

  const initialValue = React.useMemo(() => {
    return normalizeInitialValue(
      {
        plugins,
        disableCorePlugins,
      },
      toSlateValue(props.value)
    );
  }, [props.value, plugins]);

  const classNames = cx(
    styles.editor,
    props.minHeight !== undefined ? css({ minHeight: props.minHeight }) : undefined,
    props.maxHeight !== undefined ? css({ maxHeight: props.maxHeight }) : undefined,
    props.isDisabled ? styles.disabled : styles.enabled,
    props.isToolbarHidden && styles.hiddenToolbar
  );

  return (
    <SdkProvider sdk={sdk}>
      <ContentfulEditorIdProvider value={id}>
        <div className={styles.root} data-test-id="rich-text-editor">
          <PlateProvider
            id={id}
            initialValue={initialValue}
            plugins={plugins}
            disableCorePlugins={disableCorePlugins}
          >
            {!props.isToolbarHidden && (
              <StickyToolbarWrapper isDisabled={props.isDisabled}>
                <Toolbar isDisabled={props.isDisabled} />
              </StickyToolbarWrapper>
            )}
            <SyncEditorChanges incomingValue={initialValue} onChange={props.onChange} />
            <Plate
              id={id}
              editableProps={{
                className: classNames,
                readOnly: props.isDisabled,
              }}
            />
          </PlateProvider>
        </div>
      </ContentfulEditorIdProvider>
    </SdkProvider>
  );
};

type Props = ConnectedProps & { isInitiallyDisabled: boolean };

const RichTextEditor = (props: Props) => {
  const { sdk, isInitiallyDisabled, onAction, restrictedMarks, ...otherProps } = props;
  const isEmptyValue = React.useCallback(
    (value) => !value || deepEquals(value, Contentful.EMPTY_DOCUMENT),
    []
  );

  const id = getContentfulEditorId(props.sdk);
  return (
    <EntityProvider sdk={sdk}>
      <FieldConnector
        debounce={0}
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
