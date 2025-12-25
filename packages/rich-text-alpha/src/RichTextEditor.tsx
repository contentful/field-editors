import * as React from 'react';

import type { FieldAppSDK } from '@contentful/app-sdk';
import { FieldConnector } from '@contentful/field-editor-shared';
import type { Document } from '@contentful/rich-text-types';
import { ProseMirror, ProseMirrorDoc } from '@handlewithcare/react-prosemirror';
import { css, cx } from 'emotion';

import { createEditor } from './plugins';
import { styles } from './RichTextEditor.styles';
import { isEmptyField } from './utils/isEmptyField';

export type RichTextProps = {
  sdk: FieldAppSDK;
  isInitiallyDisabled: boolean;
  minHeight?: string | number;
  maxHeight?: string | number;
  value?: Document;
  onAction?: (name: string, data: Record<string, unknown>) => void;
  isToolbarHidden?: boolean;
  withCharValidation?: boolean;

  /**
   * Extra components to be rendered inside the editor hence have access
   * to the editor state.
   *
   * For internal use only. e.g. dev tools integration.
   * @internal
   */
  extraChildren?: React.ReactNode;
};

const Editor = (props: RichTextProps) => {
  const { sdk, extraChildren } = props;

  const state = React.useMemo(() => {
    return createEditor();
  }, []);

  // Force text direction based on editor locale
  const direction = sdk.locales.direction[sdk.field.locale] ?? 'ltr';

  const style = cx(
    styles.editor,
    props.minHeight !== undefined ? css({ minHeight: props.minHeight }) : undefined,
    props.maxHeight !== undefined ? css({ maxHeight: props.maxHeight }) : undefined,
    props.isToolbarHidden && styles.hiddenToolbar,
    direction === 'rtl' ? styles.rtl : styles.ltr,
  );

  return (
    <div className={styles.root} data-test-id="rich-text-editor">
      <ProseMirror className={style} defaultState={state}>
        <ProseMirrorDoc />
        {extraChildren}
      </ProseMirror>
    </div>
  );
};

export const RichTextEditor = (props: RichTextProps) => {
  const { sdk, isInitiallyDisabled } = props;

  return (
    <FieldConnector
      debounce={0}
      field={sdk.field}
      isInitiallyDisabled={isInitiallyDisabled}
      isEmptyValue={isEmptyField}
    >
      {() => {
        return <Editor {...props} />;
      }}
    </FieldConnector>
  );
};
