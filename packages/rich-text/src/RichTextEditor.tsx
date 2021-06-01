import React, { useCallback, useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact, DefaultElement, RenderLeafProps } from 'slate-react';
import { toContentfulDocument, toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import * as Contentful from '@contentful/rich-text-types';
import { EntityProvider } from '@contentful/field-editor-reference';
import { css, cx } from 'emotion';
import { styles } from './RichTextEditor.styles';
import { FieldExtensionSDK, FieldConnector } from '@contentful/field-editor-shared';
import schema from './constants/Schema';
import deepEquals from 'fast-deep-equal';
import flow from 'lodash/flow';
import { withHistory } from 'slate-history';
import { withBoldEvents } from './plugins/Bold';
import { withItalicEvents } from './plugins/Italic';
import { withCodeEvents } from './plugins/Code';
import { withMarksPlugin } from './plugins/Marks';
import { withUnderlineEvents } from './plugins/Underline';
import { withEditorPlugin } from './plugins/Editor';
import { Hr, withHrEvents } from './plugins/Hr';
import { Quote, withQuoteEvents } from './plugins/Quote';
import { Leaf } from './plugins/Leaf';
import Toolbar from './Toolbar';
import StickyToolbarWrapper from './Toolbar/StickyToolbarWrapper';
import { CustomElement, CustomEditor } from './types';
import { H1, H2, H3, H4, H5, H6, withHeadingEvents } from './plugins/Heading';
import { UL, OL, LI, withListEvents } from './plugins/List';

type ConnectedProps = {
  sdk: FieldExtensionSDK;
  minHeight?: string | number;
  value?: object;
  isDisabled?: boolean;
  onChange?: (doc: Contentful.Document) => unknown;
  onAction?: () => unknown;
  isToolbarHidden?: boolean;
  actionsDisabled?: boolean;
};

const withPlugins = flow([withReact, withHistory, withMarksPlugin, withEditorPlugin]);

const withEvents = (editor) => (event) =>
  [
    withBoldEvents,
    withItalicEvents,
    withCodeEvents,
    withUnderlineEvents,
    withHrEvents,
    withHeadingEvents,
    withQuoteEvents,
    withListEvents,
  ].forEach((fn) => fn(editor, event));

const elements = {
  [Contentful.BLOCKS.HR]: Hr,
  [Contentful.BLOCKS.HEADING_1]: H1,
  [Contentful.BLOCKS.HEADING_2]: H2,
  [Contentful.BLOCKS.HEADING_3]: H3,
  [Contentful.BLOCKS.HEADING_4]: H4,
  [Contentful.BLOCKS.HEADING_5]: H5,
  [Contentful.BLOCKS.HEADING_6]: H6,
  [Contentful.BLOCKS.UL_LIST]: UL,
  [Contentful.BLOCKS.OL_LIST]: OL,
  [Contentful.BLOCKS.LIST_ITEM]: LI,
  [Contentful.BLOCKS.QUOTE]: Quote,
};

const ConnectedRichTextEditor = (props: ConnectedProps) => {
  const editor = useMemo<CustomEditor>(() => withPlugins(createEditor()), []);

  const document = toSlatejsDocument({
    document: props.value || Contentful.EMPTY_DOCUMENT,
    schema,
  });

  const [value, setValue] = useState(document as CustomElement[]);

  const renderElement = useCallback((props) => {
    return React.createElement(elements[props.element.type] ?? DefaultElement, { ...props });
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  const classNames = cx(
    styles.editor,
    props.minHeight !== undefined ? css({ minHeight: props.minHeight }) : undefined,
    props.isDisabled ? styles.disabled : styles.enabled,
    props.isToolbarHidden && styles.hiddenToolbar
  );

  return (
    <div className={styles.root} data-test-id="rich-text-editor">
      <Slate
        editor={editor}
        // TODO: normalize like in the webapp?
        // cf. https://github.com/contentful/field-editors/blob/master/packages/rich-text/src/RichTextEditor.jsx#L69-L85
        value={value}
        onChange={(newValue) => {
          setValue(newValue as CustomElement[]);
          const doc = toContentfulDocument({ document: newValue, schema });
          props.onChange?.(doc);
        }}>
        {!props.isToolbarHidden && (
          <StickyToolbarWrapper isDisabled={props.isDisabled}>
            <Toolbar isDisabled={props.isDisabled} />
          </StickyToolbarWrapper>
        )}
        <Editable
          className={classNames}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={withEvents(editor)}
          readOnly={props.isDisabled}
        />
      </Slate>
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
    </EntityProvider>
  );
};

export default RichTextEditor;
