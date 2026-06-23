import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import { EntityProvider } from '@contentful/field-editor-reference';
import { FieldConnector } from '@contentful/field-editor-shared';
import * as Contentful from '@contentful/rich-text-types';
import { css, cx } from '@emotion/css';
import { QueryClient } from '@tanstack/react-query';
import { PlateContent, Plate, PlatePlugin, PlateContentProps } from '@udecode/plate-common';
import deepEquals from 'fast-deep-equal';
import noop from 'lodash/noop';
import { useDeepCompareMemo } from 'use-deep-compare';

import { CharConstraints } from './CharConstraints';
import { ContentfulEditorIdProvider, getContentfulEditorId } from './ContentfulEditorProvider';
import { defaultScrollSelectionIntoView } from './editor-overrides';
import { toSlateDoc } from './helpers/toSlateDoc';
import { logRichTextDebug, summarizeRichTextTreeForDebug } from './internal/debug';
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
  queryClient?: QueryClient;
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
  queryClient?: QueryClient;
};

const getChangedPropNames = (
  previousProps: ConnectedRichTextProps | undefined,
  nextProps: ConnectedRichTextProps,
) => {
  if (!previousProps) {
    return ['initial-render'];
  }

  return [
    previousProps.actionsDisabled !== nextProps.actionsDisabled && 'actionsDisabled',
    previousProps.isDisabled !== nextProps.isDisabled && 'isDisabled',
    previousProps.isToolbarHidden !== nextProps.isToolbarHidden && 'isToolbarHidden',
    previousProps.maxHeight !== nextProps.maxHeight && 'maxHeight',
    previousProps.minHeight !== nextProps.minHeight && 'minHeight',
    previousProps.onAction !== nextProps.onAction && 'onAction',
    previousProps.onChange !== nextProps.onChange && 'onChange',
    previousProps.queryClient !== nextProps.queryClient && 'queryClient',
    previousProps.restrictedMarks !== nextProps.restrictedMarks && 'restrictedMarks',
    previousProps.sdk !== nextProps.sdk && 'sdk',
    previousProps.stickyToolbarOffset !== nextProps.stickyToolbarOffset && 'stickyToolbarOffset',
    previousProps.value !== nextProps.value && 'value',
    previousProps.withCharValidation !== nextProps.withCharValidation && 'withCharValidation',
  ].filter((name): name is string => Boolean(name));
};

export const ConnectedRichTextEditor = React.memo(function ConnectedRichTextEditor(
  props: ConnectedRichTextProps,
) {
  const { sdk, onAction, restrictedMarks, withCharValidation } = props;

  const id = getContentfulEditorId(sdk);
  const renderCount = React.useRef(0);
  const initialDebugPayload = React.useRef<Record<string, unknown>>();
  const previousProps = React.useRef<ConnectedRichTextProps>();
  renderCount.current += 1;

  if (!initialDebugPayload.current) {
    initialDebugPayload.current = {
      props: {
        isDisabled: props.isDisabled,
        isToolbarHidden: props.isToolbarHidden,
        withCharValidation: props.withCharValidation,
      },
      value: summarizeRichTextTreeForDebug(props.value),
    };
  }

  React.useEffect(() => {
    logRichTextDebug('ConnectedRichTextEditor:mounted', () => ({
      editorId: id,
      ...(initialDebugPayload.current ?? {}),
    }));

    return () => {
      logRichTextDebug('ConnectedRichTextEditor:unmounted', () => ({
        editorId: id,
        renderCount: renderCount.current,
      }));
    };
  }, [id]);

  React.useEffect(() => {
    logRichTextDebug('ConnectedRichTextEditor:rendered', () => ({
      changedProps: getChangedPropNames(previousProps.current, props),
      editorId: id,
      props: {
        actionsDisabled: props.actionsDisabled,
        isDisabled: props.isDisabled,
        isToolbarHidden: props.isToolbarHidden,
        stickyToolbarOffset: props.stickyToolbarOffset,
        withCharValidation: props.withCharValidation,
      },
      renderCount: renderCount.current,
      value: summarizeRichTextTreeForDebug(props.value),
    }));

    previousProps.current = props;
  });

  const plugins = React.useMemo(
    () => getPlugins(sdk, onAction ?? noop, restrictedMarks, withCharValidation),
    [sdk, onAction, restrictedMarks, withCharValidation],
  );

  React.useEffect(() => {
    logRichTextDebug('ConnectedRichTextEditor:pluginsChanged', () => ({
      editorId: id,
      pluginCount: plugins.length,
      pluginKeys: plugins.map((plugin) => plugin.key),
    }));
  }, [id, plugins]);

  const initialValue = useDeepCompareMemo(() => {
    return toSlateDoc(props.value);
  }, [props.value]);

  React.useEffect(() => {
    logRichTextDebug('ConnectedRichTextEditor:incomingValueConverted', () => ({
      editorId: id,
      initialValue: summarizeRichTextTreeForDebug(initialValue),
    }));
  }, [id, initialValue]);

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
    <EntityProvider sdk={sdk} queryClient={props.queryClient}>
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
});

const RichTextEditor = (props: RichTextProps) => {
  const {
    sdk,
    isInitiallyDisabled,
    onAction,
    restrictedMarks,
    onChange,
    isDisabled,
    queryClient,
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
          queryClient={queryClient}
        />
      )}
    </FieldConnector>
  );
};

export default RichTextEditor;
