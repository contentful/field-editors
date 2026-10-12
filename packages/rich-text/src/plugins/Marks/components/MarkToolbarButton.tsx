import * as React from 'react';

import { Menu } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { MARKS } from '@contentful/rich-text-types';
import { css, cx } from '@emotion/css';
import { useEditorSelector } from 'platejs/react';

import { useContentfulEditorRef } from '../../../ContentfulEditorProvider';
import { focus } from '../../../helpers/editor';
import { isMarkActive } from '../../../internal/queries';
import { PlateEditor } from '../../../internal/types';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { toggleMarkAndDeactivateConflictingMarks } from '../helpers';

export interface MarkOptions {
  mark: MARKS;
  title: string;
  icon?: React.ReactElement;
}

const styles = {
  isActive: css({
    backgroundColor: tokens.blue100,
    color: tokens.blue600,
  }),
};

export const createMarkToolbarButton = ({ mark, title, icon }: MarkOptions) => {
  const Mark = ({ isDisabled }: { isDisabled?: boolean }) => {
    const editor = useContentfulEditorRef();
    const isActive = useEditorSelector((editor: PlateEditor) => isMarkActive(editor, mark), []);

    const handleClick = React.useCallback(() => {
      if (!editor?.selection) return;

      const isActive = isMarkActive(editor, mark);
      editor.tracking.onToolbarAction(isActive ? 'unmark' : 'mark', { markType: mark });

      toggleMarkAndDeactivateConflictingMarks(editor, mark);
      focus(editor);
    }, [editor]);

    if (!editor) return null;

    if (!icon) {
      return (
        <Menu.Item
          onClick={handleClick}
          disabled={isDisabled}
          className={cx({
            [styles.isActive]: isActive,
          })}
          testId={`${mark}-toolbar-button`}>
          {title}
        </Menu.Item>
      );
    }

    return (
      <ToolbarButton
        title={title}
        testId={`${mark}-toolbar-button`}
        onClick={handleClick}
        isActive={isActive}
        isDisabled={isDisabled}>
        {icon}
      </ToolbarButton>
    );
  };

  Mark.displayName = mark;

  return Mark;
};
