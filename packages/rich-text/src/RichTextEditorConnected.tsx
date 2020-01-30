import * as React from 'react';
import { FieldAPI } from '@contentful/field-editor-shared';

export interface RichTextEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  field: FieldAPI;
}

export function RichTextEditor() {
  return <div>!!! RichTextEditor !!!</div>;
}

RichTextEditor.defaultProps = {
  isInitiallyDisabled: true
};
