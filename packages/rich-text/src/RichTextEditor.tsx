import React, { useMemo, useState } from 'react'
import { createEditor, BaseEditor } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import { toContentfulDocument, toSlatejsDocument } from '@contentful/contentful-slatejs-adapter'
import * as Contentful from '@contentful/rich-text-types';
import { EntityProvider } from '@contentful/field-editor-reference';
import { FieldExtensionSDK, FieldConnector } from '@contentful/field-editor-shared';
import schema from './constants/Schema';
import deepEquals from 'fast-deep-equal';

type CustomElement = {
  type: 'paragraph';
  children: CustomText[]
}
type CustomText = { text: string }

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

const toContentfulDocumentDebounced = (document, schema) => {
  // TODO: Do we need to debounce 500ms, like in master?
  return toContentfulDocument({ document, schema });
};

type ConnectedProps = {
  minHeight: string | number
  sdk: FieldExtensionSDK,
  value: object,
  isDisabled: boolean,
  onChange: (doc: Contentful.Document) => unknown;
  onAction: () => unknown,
  isToolbarHidden: boolean,
  actionsDisabled: boolean,
};

const ConnectedRichTextEditor = (props: ConnectedProps) => {
  const editor = useMemo(() => withReact(createEditor()), [])

  const document = toSlatejsDocument({
    document: props.value || Contentful.EMPTY_DOCUMENT,
    schema
  });
  
  const [value, setValue] = useState(document as CustomElement[])

  return (
    <Slate
      editor={editor}
      // TODO: normalize like in the webapp?
      value={value}
      onChange={newValue => {
        setValue(newValue as CustomElement[]);
        const doc = toContentfulDocumentDebounced(newValue, schema);
        props.onChange(doc);
      }}>
      <Editable />
    </Slate>
  )
};

type Props = ConnectedProps & { isInitiallyDisabled: boolean };

const RichTextEditor = (props: Props) => {
  const { sdk, isInitiallyDisabled, ...otherProps } = props;
  return (
    <EntityProvider sdk={sdk}>
      <FieldConnector
        throttle={0}
        field={sdk.field}
        isInitiallyDisabled={isInitiallyDisabled}
        isEmptyValue={(value) => !value || deepEquals(value, Contentful.EMPTY_DOCUMENT)}
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
        )
      }
      </FieldConnector>
    </EntityProvider>
  );
}

export default RichTextEditor;
