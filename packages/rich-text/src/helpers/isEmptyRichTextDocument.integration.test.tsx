import * as React from 'react';

import { FieldConnector } from '@contentful/field-editor-shared';
import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import {
  BLOCKS,
  MARKS,
  type Document,
  type Mark,
  type Paragraph,
} from '@contentful/rich-text-types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';

import { isEmptyRichTextDocument } from './isEmptyRichTextDocument';

const paragraph = (value: string, marks: Mark[] = []): Paragraph => ({
  nodeType: BLOCKS.PARAGRAPH,
  data: {},
  content: [{ nodeType: 'text', value, marks, data: {} }],
});
const document = (...content: Document['content']): Document => ({
  nodeType: BLOCKS.DOCUMENT,
  data: {},
  content,
});
const initialValue = document(paragraph('content'));

const emptyList = (type: BLOCKS.UL_LIST | BLOCKS.OL_LIST) =>
  document(
    {
      nodeType: type,
      data: {},
      content: [
        { nodeType: BLOCKS.LIST_ITEM, data: {}, content: [paragraph('', [{ type: MARKS.BOLD }])] },
      ],
    },
    paragraph(''),
  );

it.each([
  ['multiple empty paragraphs', document(paragraph(''), paragraph(''))],
  ['an empty unordered list', emptyList(BLOCKS.UL_LIST)],
  ['an empty ordered list', emptyList(BLOCKS.OL_LIST)],
])('removes the SDK field value after editing to %s', async (_description, editedValue) => {
  const [field] = createFakeFieldAPI(undefined, initialValue);

  render(
    <FieldConnector<Document>
      field={field}
      isInitiallyDisabled={false}
      isEmptyValue={isEmptyRichTextDocument}
      debounce={0}>
      {({ setValue }) => <button onClick={() => void setValue(editedValue)}>Save edit</button>}
    </FieldConnector>,
  );

  expect(field.getValue()).toEqual(initialValue);
  fireEvent.click(screen.getByRole('button', { name: 'Save edit' }));

  await waitFor(() => expect(field.getValue()).toBeUndefined());
});

it('saves a horizontal rule even though it contains no text', async () => {
  const [field] = createFakeFieldAPI(undefined, initialValue);
  const editedValue = document({ nodeType: BLOCKS.HR, data: {}, content: [] }, paragraph(''));

  render(
    <FieldConnector<Document>
      field={field}
      isInitiallyDisabled={false}
      isEmptyValue={isEmptyRichTextDocument}
      debounce={0}>
      {({ setValue }) => <button onClick={() => void setValue(editedValue)}>Save edit</button>}
    </FieldConnector>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Save edit' }));

  await waitFor(() => expect(field.getValue()).toEqual(editedValue));
});
