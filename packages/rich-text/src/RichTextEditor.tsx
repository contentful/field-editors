import React, { useCallback, useState } from 'react';
import { toContentfulDocument, toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import * as Contentful from '@contentful/rich-text-types';
import { EntityProvider } from '@contentful/field-editor-reference';
import { css, cx } from 'emotion';
import { styles } from './RichTextEditor.styles';
import { FieldExtensionSDK, FieldConnector } from '@contentful/field-editor-shared';
import schema from './constants/Schema';
import deepEquals from 'fast-deep-equal';
import Toolbar from './Toolbar';
import StickyToolbarWrapper from './Toolbar/StickyToolbarWrapper';
import { withListOptions } from './plugins/List';
import {
  SlatePlugins,
  createHistoryPlugin,
  createReactPlugin,
  SlatePlugin,
  SPEditor,
} from '@udecode/slate-plugins-core';
import { createListPlugin } from '@udecode/slate-plugins-list';
import { createDeserializeHTMLPlugin } from '@udecode/slate-plugins-html-serializer';
import { createHrPlugin, withHrOptions } from './plugins/Hr';
import { withHeadingOptions, createHeadingPlugin } from './plugins/Heading';
import { createBoldPlugin, withBoldOptions } from './plugins/Bold';
import { withCodeOptions, createCodePlugin } from './plugins/Code';
import { withItalicOptions, createItalicPlugin } from './plugins/Italic';
import { createUnderlinePlugin, withUnderlineOptions } from './plugins/Underline';
import { createParagraphPlugin, withParagraphOptions } from './plugins/Paragraph';
import { createQuotePlugin, withQuoteOptions } from './plugins/Quote';
import { createNewLinePlugin } from './plugins/NewLine';
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
import { sanitizeIncomingSlateDoc, sanitizeSlateDoc } from './helpers/sanitizeSlateDoc';
import { TextOrCustomElement } from './types';

type ConnectedProps = {
  editorId?: string;
  sdk: FieldExtensionSDK;
  minHeight?: string | number;
  value?: object;
  isDisabled?: boolean;
  onChange?: (doc: Contentful.Document) => unknown;
  onAction?: () => unknown;
  isToolbarHidden?: boolean;
  actionsDisabled?: boolean;
};

const getPlugins = (sdk: FieldExtensionSDK) => {
  const plugins = [
    // Core
    createReactPlugin(),
    createHistoryPlugin(),

    // Global shortcuts
    createNewLinePlugin(),

    // Block Elements
    createParagraphPlugin(),
    createListPlugin(),
    createHrPlugin(),
    createHeadingPlugin(),
    createQuotePlugin(),
    createTablePlugin(),
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
  ];

  return plugins.concat([createDeserializeHTMLPlugin({ plugins })] as SlatePlugin<SPEditor>[]);
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

const ConnectedRichTextEditor = (props: ConnectedProps) => {
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

  const plugins = React.useMemo(() => getPlugins(props.sdk), [props.sdk]);

  return (
    <div className={styles.root} data-test-id="rich-text-editor">
      <SlatePlugins
        id={props.editorId}
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
        options={options}>
        {!props.isToolbarHidden && (
          <StickyToolbarWrapper isDisabled={props.isDisabled}>
            <Toolbar isDisabled={props.isDisabled} />
          </StickyToolbarWrapper>
        )}
      </SlatePlugins>
    </div>
  );
};

type Props = ConnectedProps & { isInitiallyDisabled: boolean };

const RichTextEditor = (props: Props) => {
  const { sdk, isInitiallyDisabled, ...otherProps } = props;
  const isEmptyValue = useCallback(
    (value) => !value || deepEquals(value, Contentful.EMPTY_DOCUMENT),
    []
  );
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
            <ConnectedRichTextEditor
              {...otherProps}
              // TODO: do we still need this with ShareJS gone?
              // on external change reset component completely and init with initial value again
              key={`rich-text-editor-${externalReset}`}
              value={lastRemoteValue}
              sdk={sdk}
              isDisabled={disabled}
              onChange={setValue}
            />
          )}
        </FieldConnector>
      </SdkProvider>
    </EntityProvider>
  );
};

export default RichTextEditor;
