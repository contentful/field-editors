import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import { EntityProvider } from '@contentful/field-editor-reference';
import { FieldConnector } from '@contentful/field-editor-shared';
import * as Contentful from '@contentful/rich-text-types';
import { PlateContent, Plate, PlatePlugin, PlateContentProps } from '@udecode/plate-common';
import { css, cx } from 'emotion';
import deepEquals from 'fast-deep-equal';
import noop from 'lodash/noop';

import { CharConstraints } from './CharConstraints';
import { ContentfulEditorIdProvider, getContentfulEditorId } from './ContentfulEditorProvider';
import { defaultScrollSelectionIntoView } from './editor-overrides';
import { toSlateDoc } from './helpers/toSlateDoc';
import { getPlugins, disableCorePlugins } from './plugins';
import { RichTextTrackingActionHandler } from './plugins/Tracking';
import { styles } from './RichTextEditor.styles';
import { SdkProvider } from './SdkProvider';
import { SyncEditorChanges } from './SyncEditorChanges';
import Toolbar from './Toolbar';
import StickyToolbarWrapper from './Toolbar/components/StickyToolbarWrapper';

type RichTextProps = {
  sdk: FieldAppSDK;
  isInitiallyDisabled: boolean;
  onAction?: RichTextTrackingActionHandler;
  restrictedMarks?: string[];
  // For passing down to connected editor, some refactoring needed
  minHeight?: string | number;
  maxHeight?: string | number;
  value?: Contentful.Document;
  isDisabled?: boolean;
  isToolbarHidden?: boolean;
  actionsDisabled?: boolean;
  /**
   * @deprecated Use `sdk.field.onValueChanged` instead
   */
  onChange?: (doc: Contentful.Document) => unknown;
  withCharValidation?: boolean;
};

type ConnectedRichTextProps = {
  sdk: FieldAppSDK;
  onAction?: RichTextTrackingActionHandler;
  onChange?: (doc: Contentful.Document) => unknown;
  restrictedMarks?: string[];
  minHeight?: string | number;
  maxHeight?: string | number;
  value?: Contentful.Document;
  isDisabled?: boolean;
  isToolbarHidden?: boolean;
  actionsDisabled?: boolean;
  stickyToolbarOffset?: number;
  withCharValidation?: boolean;
};

export const ConnectedRichTextEditor = (props: ConnectedRichTextProps) => {
  const { sdk, onAction, restrictedMarks, withCharValidation } = props;

  const id = getContentfulEditorId(sdk);
  const plugins = React.useMemo(
    () => getPlugins(sdk, onAction ?? noop, restrictedMarks, withCharValidation),
    [sdk, onAction, restrictedMarks, withCharValidation],
  );

  const initialValue = toSlateDoc(props.value);

  // Force text direction based on editor locale
  const direction = sdk.locales.direction[sdk.field.locale] ?? 'ltr';

  const classNames = cx(
    styles.editor,
    props.minHeight !== undefined ? css({ minHeight: props.minHeight }) : undefined,
    props.maxHeight !== undefined ? css({ maxHeight: props.maxHeight }) : undefined,
    props.isDisabled ? styles.disabled : styles.enabled,
    props.isToolbarHidden && styles.hiddenToolbar,
    direction === 'rtl' ? styles.rtl : styles.ltr,
  );

  return (
    <EntityProvider sdk={sdk}>
      <SdkProvider sdk={sdk}>
        <ContentfulEditorIdProvider value={id}>
          <div className={styles.root} data-test-id="rich-text-editor">
            <Plate
              id={id}
              initialValue={initialValue}
              plugins={plugins as PlatePlugin[]}
              disableCorePlugins={disableCorePlugins}
            >
              {!props.isToolbarHidden && (
                <StickyToolbarWrapper
                  isDisabled={props.isDisabled}
                  offset={props.stickyToolbarOffset}
                >
                  <Toolbar isDisabled={props.isDisabled} />
                </StickyToolbarWrapper>
              )}
              <SyncEditorChanges incomingValue={initialValue} onChange={props.onChange} />
              <PlateContent
                id={id}
                className={classNames}
                readOnly={props.isDisabled}
                scrollSelectionIntoView={
                  defaultScrollSelectionIntoView as PlateContentProps['scrollSelectionIntoView']
                }
              />
              {props.withCharValidation && <CharConstraints />}
            </Plate>
          </div>
        </ContentfulEditorIdProvider>
      </SdkProvider>
    </EntityProvider>
  );
};

const RichTextEditor = (props: RichTextProps) => {
  const {
    sdk,
    isInitiallyDisabled,
    onAction,
    restrictedMarks,
    onChange,
    isDisabled,
    ...otherProps
  } = props;
  const isEmptyValue = React.useCallback(
    (value) => !value || deepEquals(value, Contentful.EMPTY_DOCUMENT),
    [],
  );
  React.useEffect(() => {
    if (!onChange) {
      return;
    }
    return sdk.field.onValueChanged(onChange);
  }, [onChange, sdk.field]);

  const id = getContentfulEditorId(props.sdk);
  return (
    <FieldConnector
      debounce={0}
      field={sdk.field}
      isInitiallyDisabled={isInitiallyDisabled}
      isEmptyValue={isEmptyValue}
      isDisabled={isDisabled}
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
          withCharValidation={props.withCharValidation ?? true}
        />
      )}
    </FieldConnector>
  );
};

export default RichTextEditor;
