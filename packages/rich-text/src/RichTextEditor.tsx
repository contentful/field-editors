import React, { useCallback, useMemo, useState } from 'react';
import { createEditor, BaseEditor } from 'slate';
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  DefaultElement,
  RenderLeafProps,
} from 'slate-react';
import { toContentfulDocument, toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import * as Contentful from '@contentful/rich-text-types';
import { EntityProvider } from '@contentful/field-editor-reference';
import { FieldExtensionSDK, FieldConnector } from '@contentful/field-editor-shared';
import schema from './constants/Schema';
import deepEquals from 'fast-deep-equal';
import debounce from 'lodash/debounce';
import flow from 'lodash/flow';
import { withBoldEvents } from './plugins/Bold';
import { withItalicEvents } from './plugins/Italic';
import { withCodeEvents } from './plugins/Code';
import { withMarksPlugin } from './plugins/Marks';
import { withUnderlineEvents } from './plugins/Underline';
import { Leaf } from './plugins/Leaf';
import { ContentfulEditor } from './types';

type CustomElement = {
  type: 'paragraph';
  children: CustomText[];
};
type CustomText = { text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

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

const withPlugins = flow([withReact, withMarksPlugin]);

const withEvents = (editor) => (event) =>
  [withBoldEvents, withItalicEvents, withCodeEvents, withUnderlineEvents].forEach((fn) =>
    fn(editor, event)
  );

const ConnectedRichTextEditor = (props: ConnectedProps) => {
  const editor = useMemo<ContentfulEditor>(() => withReact(withPlugins(createEditor())), []);

  const document = toSlatejsDocument({
    document: props.value || Contentful.EMPTY_DOCUMENT,
    schema,
  });

  const [value, setValue] = useState(document as CustomElement[]);

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      // TODO: add the components for `code`, `paragraph`, `image`, etc
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  return (
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
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={withEvents(editor)}
      />
    </Slate>
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
            onChange={debounce(setValue, 500)}
          />
        )}
      </FieldConnector>
    </EntityProvider>
  );
};

export default RichTextEditor;
