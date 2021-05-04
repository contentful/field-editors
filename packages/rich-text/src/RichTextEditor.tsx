import React, { useMemo, useState } from 'react'
import { createEditor, BaseEditor } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import debounce from 'lodash-es/debounce'
import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter'
import * as Contentful from '@contentful/rich-text-types';
import schema from './constants/Schema';

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

const toContentfulDocumentDebounced = debounce((document, schema) => {
  return toContentfulDocument({ document, schema });
}, 500);

type Props = {
  onChange: (doc: Contentful.Document) => unknown;
};

// Define our app...
const RichTextEditor = (props: Props) => {
  const editor = useMemo(() => withReact(createEditor()), [])

  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ] as CustomElement[])

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => {
        setValue(newValue as CustomElement[]);
        const doc = toContentfulDocumentDebounced(newValue, schema);
        props.onChange(doc);
      }}>
      <Editable />
    </Slate>
  )
}

export default RichTextEditor;
