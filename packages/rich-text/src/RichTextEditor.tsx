// Import React dependencies.
import React, { useMemo, useState } from 'react'

// Import the Slate editor factory.
import { createEditor, BaseEditor } from 'slate'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'

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

// Define our app...
const RichTextEditor = () => {
  const editor = useMemo(() => withReact(createEditor()), [])

  // Keep track of state for the value of the editor.
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ] as CustomElement[])

  // Render the Slate context.
  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue as CustomElement[])}>
      <Editable />
    </Slate>
  )
}

export default RichTextEditor;
