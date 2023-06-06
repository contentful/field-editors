import * as React from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { Menu } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { MARKS } from '@contentful/rich-text-types';
import { PlateEditor } from '@udecode/plate-core';
import { css, cx } from 'emotion';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { focus } from '../../../helpers/editor';
import { isMarkActive } from '../../../internal/queries';
import { useSdkContext } from '../../../SdkProvider';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { toggleMarkAndDeactivateConflictingMarks } from '../helpers';

export interface MarkOptions {
  mark: MARKS;
  title: string;
  icon?: React.ReactElement;
  callback?: (
    sdk: FieldExtensionSDK & { field: { comments: { create: any } } },
    editor: PlateEditor
  ) => void;
}

const styles = {
  isActive: css({
    backgroundColor: tokens.blue100,
    color: tokens.blue600,
  }),
};

export const createMarkToolbarButton = ({ mark, title, icon, callback }: MarkOptions) => {
  const Mark = ({ isDisabled }: { isDisabled?: boolean }) => {
    const editor = useContentfulEditor();
    const sdk = useSdkContext();

    const handleClick = React.useCallback(() => {
      if (!editor?.selection) return;

      const isActive = isMarkActive(editor, mark);

      // Q: maybe this would not be the case for comments. We can't unmark comments
      editor.tracking.onToolbarAction(isActive ? 'unmark' : 'mark', { markType: mark });

      toggleMarkAndDeactivateConflictingMarks(editor, mark);
      focus(editor);
      if (callback) callback(sdk as any, editor);
    }, [editor, sdk]);

    if (!editor) return null;

    if (!icon) {
      return (
        <Menu.Item
          onClick={handleClick}
          disabled={isDisabled}
          className={cx({
            [styles.isActive]: isMarkActive(editor, mark),
          })}
          testId={`${mark}-toolbar-button`}
        >
          {title}
        </Menu.Item>
      );
    }

    return (
      <ToolbarButton
        title={title}
        testId={`${mark}-toolbar-button`}
        onClick={handleClick}
        isActive={isMarkActive(editor, mark)}
        isDisabled={isDisabled}
      >
        {icon}
      </ToolbarButton>
    );
  };

  Mark.displayName = mark;

  return Mark;
};
