import React, { useCallback, useState, useEffect, useMemo } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { EntityProvider } from '@contentful/field-editor-reference';
import { FieldConnector } from '@contentful/field-editor-shared';
import * as Contentful from '@contentful/rich-text-types';
import { Plate, getPlateActions } from '@udecode/plate-core';
import { css, cx } from 'emotion';
import deepEquals from 'fast-deep-equal';
import noop from 'lodash/noop';

import { ContentfulEditorIdProvider, getContentfulEditorId } from './ContentfulEditorProvider';
import { enhanceContentfulDocWithComments } from './helpers/removeInternalMarks';
import { getPlateSelectors } from './internal/misc';
import { Value } from './internal/types';
import { getPlugins, disableCorePlugins } from './plugins';
import { RichTextTrackingActionHandler } from './plugins/Tracking';
import { documentToEditorValue, normalizeEditorValue, setEditorContent } from './prepareDocument';
import { styles } from './RichTextEditor.styles';
import { SdkProvider } from './SdkProvider';
import Toolbar from './Toolbar';
import StickyToolbarWrapper from './Toolbar/components/StickyToolbarWrapper';
import { useOnValueChanged } from './useOnValueChanged';

export type InlineComment = {
  metadata: {
    //to ask: should the range just be one path or multiple paths?, insted of a "range"
    range: string[];
    originalText: string;
  };
  body: string; // here the body would actually also be rich text since comments are now rich text
  sys: {
    id: string;
  };
};

type ConnectedProps = {
  sdk: FieldExtensionSDK & {
    field: {
      comments: {
        open: (commentId: string) => void;
        get: InlineComment[];
        create: () => void;
        update: (commentId: string, comment: InlineComment) => void;
        delete: (commentId: string) => void;
      };
    };
  };
  onAction?: RichTextTrackingActionHandler;
  minHeight?: string | number;
  value?: object;
  isDisabled?: boolean;
  onChange?: (doc: Contentful.Document) => unknown;
  isToolbarHidden?: boolean;
  actionsDisabled?: boolean;
  restrictedMarks?: string[];
};

export const ConnectedRichTextEditor = (props: ConnectedProps) => {
  const id = getContentfulEditorId(props.sdk);

  const [localComments, setLocalComments]: any = useState([]);

  const listener: any = (e: any) => {
    console.log('listener: ', { e });
    setLocalComments([
      ...localComments,
      {
        ...e.detail.comment,
        metadata: {
          range: e.detail.range,
          originalText: 'Hello world',
        },
      },
    ]);
  };

  useEffect(() => {
    document.addEventListener(`comments:created` as any, listener);
    return () => {
      return document.removeEventListener(`comments:created`, listener);
    };
    /* eslint-disable */
  }, []);
  /* eslint-enable */

  // SHow comments right after they are created
  // const ranges = props.sdk.field.comments.get
  //   .map((comment) => `${comment.sys.id}${comment.metadata.range.sort()}`)
  //   .join(':');
  //
  // const richTextValueEnrichedWithComments = useMemo(() => {
  //   console.log('Recalculating...', props.sdk.field.getValue(), props.sdk.field.comments.get);
  //
  //   return enhanceContentfulDocWithComments(
  //     // props.sdk.field.getValue() as unknown as Contentful.Document,
  //     // FIXME: How can we grab the latest modified version of the document (In memory or from server?)
  //     props.sdk.field.getValue() as unknown as Contentful.Document,
  //     props.sdk.field.comments.get
  //   );
  //   /* eslint-disable */
  //   // }, [props.value, props.sdk.field.comments.get.length]);
  // }, [props.value, props.sdk.field.comments.get.length, ranges]);
  // /* eslint-enable */

  // Does not show comments right after they are created but when you create new paragraphs it doesn't crash the content
  console.log({ localValue: props.value, sdkValue: props.sdk.field.getValue() });

  // const ranges = props.sdk.field.comments.get
  //   .map((comment) => `${comment.sys.id}${comment.metadata.range.sort()}`)
  //   .join(':');

  const richTextValueEnrichedWithComments = useMemo(() => {
    console.log(
      'Recalculating...',
      props.sdk.field.getValue(),
      props.sdk.field.comments.get.concat(localComments)
    );

    return enhanceContentfulDocWithComments(
      // props.sdk.field.getValue() as unknown as Contentful.Document,
      // FIXME: How can we grab the latest modified version of the document (In memory or from server?)
      (localComments.length
        ? props.sdk.field.getValue()
        : props.value) as unknown as Contentful.Document,
      props.sdk.field.comments.get.concat(localComments)
    );
    /* eslint-disable */
    // }, [props.value, props.sdk.field.comments.get.length]);
  }, [props.value, props.sdk.field.comments.get.length, localComments]);
  /* eslint-enable */

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
    sdk: props.sdk,
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
    setEditorContent(
      editor,
      documentToEditorValue(richTextValueEnrichedWithComments as Contentful.Document)
    );
  }, [richTextValueEnrichedWithComments, id]);

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
      normalizeEditorValue(
        documentToEditorValue(richTextValueEnrichedWithComments as Contentful.Document) as Value,
        {
          plugins,
          disableCorePlugins,
        }
      )
    );
  }, [isFirstRender, plugins, id, richTextValueEnrichedWithComments]);

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
        {({ lastRemoteValue, disabled, setValue }) => {
          // FIXME: Why do I have to use this value instead of lastRemoteValue?
          // console.log({ lastRemoteValue, sdk, value });

          return (
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
          );
        }}
      </FieldConnector>
    </EntityProvider>
  );
};

export default RichTextEditor;
