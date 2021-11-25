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
import { createPastePlugin } from './plugins/Paste';
import { createListPlugin, withListOptions } from './plugins/List';
import {
  Plate,
  createHistoryPlugin,
  createReactPlugin,
  createDeserializeAstPlugin,
  createDeserializeHTMLPlugin,
} from '@udecode/plate';
import { createHrPlugin, withHrOptions } from './plugins/Hr';
import { withHeadingOptions, createHeadingPlugin } from './plugins/Heading';
import { createBoldPlugin, withBoldOptions } from './plugins/Bold';
import { withCodeOptions, createCodePlugin } from './plugins/Code';
import { withItalicOptions, createItalicPlugin } from './plugins/Italic';
import { createUnderlinePlugin, withUnderlineOptions } from './plugins/Underline';
import { createParagraphPlugin, withParagraphOptions } from './plugins/Paragraph';
import { createQuotePlugin, withQuoteOptions } from './plugins/Quote';
import { createNewLinePlugin } from './plugins/NewLine';
import { createInsertBeforeFirstVoidBlockPlugin } from './plugins/InsertBeforeFirstVoidBlock';
import { createTablePlugin, withTableOptions } from './plugins/Table';
import { createHyperlinkPlugin, withHyperlinkOptions } from './plugins/Hyperlink';
import {
  createEmbeddedAssetBlockPlugin,
  createEmbeddedEntryBlockPlugin,
  withEmbeddedAssetBlockOptions,
  withEmbeddedEntryBlockOptions,
} from './plugins/EmbeddedEntityBlock';
import {
  createEmbeddedEntityInlinePlugin,
  withEmbeddedEntityInlineOptions,
} from './plugins/EmbeddedEntityInline';
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
import { createTrailingParagraphPlugin } from './plugins/TrailingParagraph';
import { createDragAndDropPlugin } from './plugins/DragAndDrop';
import { createTextPlugin } from './plugins/Text';

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

const getPlugins = (sdk: FieldExtensionSDK, tracking: TrackingProvider) => {
  const plugins = [
    // Core
    createReactPlugin(),
    createHistoryPlugin(),

    // Behavior
    createPastePlugin(),

    // Global shortcuts
    createNewLinePlugin(),
    createInsertBeforeFirstVoidBlockPlugin(),
    createDragAndDropPlugin(),

    // Block Elements
    createParagraphPlugin(),
    createListPlugin(),
    createHrPlugin(),
    createHeadingPlugin(),
    createQuotePlugin(),
    createTablePlugin(tracking),
    createEmbeddedEntryBlockPlugin(sdk),
    createEmbeddedAssetBlockPlugin(sdk),

    // Inline elements
    createHyperlinkPlugin(sdk),
    createEmbeddedEntityInlinePlugin(sdk),

    // Marks
    createBoldPlugin(),
    createCodePlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),

    // Other
    createTrailingParagraphPlugin(),
    createTextPlugin(),
  ];

  return plugins.concat([
    createDeserializeHTMLPlugin({ plugins }),
    createDeserializeAstPlugin({ plugins }),
  ] as any);
};

const options = {
  // Block elements
  ...withParagraphOptions,
  ...withListOptions,
  ...withHrOptions,
  ...withHeadingOptions,
  ...withQuoteOptions,
  ...withTableOptions,
  ...withEmbeddedEntryBlockOptions,
  ...withEmbeddedAssetBlockOptions,

  // Inline elements
  ...withHyperlinkOptions,
  ...withEmbeddedEntityInlineOptions,

  // Marks
  ...withBoldOptions,
  ...withCodeOptions,
  ...withItalicOptions,
  ...withUnderlineOptions,
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
        options={options}>
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
