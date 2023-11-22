import * as React from 'react';

import { Menu, Button } from '@contentful/f36-components';
import { ChevronDownIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { BLOCKS } from '@contentful/rich-text-types';
import { css, cx } from 'emotion';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import {
  getElementFromCurrentSelection,
  focus,
  isBlockSelected,
  toggleElement,
} from '../../../helpers/editor';
import { isNodeTypeEnabled } from '../../../helpers/validations';
import { Element } from '../../../internal/types';
import { useSdkContext } from '../../../SdkProvider';

const styles = {
  dropdown: {
    root: css`
      font-weight: ${tokens.fontWeightNormal};
      font-family: serif;
    `,
    [BLOCKS.PARAGRAPH]: css`
      font-size: ${tokens.fontSizeL};
      font-family: sans-serif;
    `,
    [BLOCKS.HEADING_1]: css`
      font-size: 6rem;
      line-height: 144px;
    `,
    [BLOCKS.HEADING_2]: css`
      font-size: 3.5rem;
      line-height: 84px;
    `,
    [BLOCKS.HEADING_3]: css`
      font-size: 2.5rem;
      line-height: 60px;
    `,
    [BLOCKS.HEADING_4]: css`
      font-size: 2rem;
      line-height: 48px;
    `,
    [BLOCKS.HEADING_5]: css`
      font-size: 1.5rem;
      line-height: 36px;
    `,
    [BLOCKS.HEADING_6]: css`
      font-weight: ${tokens.fontWeightDemiBold};
      font-family: sans-serif;
      font-size: 1.25rem;
      line-height: 30px;
    `,
  },
};

const LABELS = {
  [BLOCKS.HEADING_1]: 'Short title',
  [BLOCKS.HEADING_2]: 'Long title',
  [BLOCKS.HEADING_3]: 'Section header',
  [BLOCKS.HEADING_4]: 'Body copy header',
  [BLOCKS.HEADING_5]: 'Serif column header',
  [BLOCKS.HEADING_6]: 'Sans Serif column header',
  [BLOCKS.PARAGRAPH]: 'Body copy',
};

export interface ToolbarHeadingButtonProps {
  isDisabled?: boolean;
}

export function ToolbarHeadingButton(props: ToolbarHeadingButtonProps) {
  const sdk = useSdkContext();
  const editor = useContentfulEditor();
  const [isOpen, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>(BLOCKS.PARAGRAPH);

  React.useEffect(() => {
    if (!editor?.selection) return;

    const [element] = getElementFromCurrentSelection(editor);
    const type = (element as Element).type;

    setSelected(LABELS[type] ? type : BLOCKS.PARAGRAPH);
  }, [editor?.operations, editor?.selection]); // eslint-disable-line -- TODO: explain this disable

  const [nodeTypesByEnablement, someHeadingsEnabled] = React.useMemo(() => {
    const nodeTypesByEnablement = Object.fromEntries(
      Object.keys(LABELS).map((nodeType) => [nodeType, isNodeTypeEnabled(sdk.field, nodeType)])
    );
    const someHeadingsEnabled = Object.values(nodeTypesByEnablement).filter(Boolean).length > 0;
    return [nodeTypesByEnablement, someHeadingsEnabled];
  }, [sdk.field]);

  function handleOnSelectItem(type: BLOCKS): (event: React.MouseEvent<HTMLButtonElement>) => void {
    return (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (!editor?.selection) return;

      setSelected(type);
      setOpen(false);

      const prevOnChange = editor.onChange;
      /*
       The focus might happen at point in time when
       `toggleElement` (helper for toggleNodeType) changes aren't rendered yet, causing the browser
       to place the cursor at the start of the text.
       We wait for the change event before focusing
       the editor again. This ensures the cursor is back at the previous
       position.*/
      editor.onChange = (...args) => {
        focus(editor);
        editor.onChange = prevOnChange;
        prevOnChange(...args);
      };

      const isActive = isBlockSelected(editor, type);
      editor.tracking.onToolbarAction(isActive ? 'remove' : 'insert', { nodeType: type });

      toggleElement(editor, { activeType: type, inactiveType: type });
    };
  }

  if (!editor) return null;

  return (
    <Menu isOpen={isOpen} onClose={() => setOpen(false)}>
      <Menu.Trigger>
        <Button
          size="small"
          testId="toolbar-heading-toggle"
          variant="transparent"
          endIcon={<ChevronDownIcon />}
          isDisabled={props.isDisabled}
          onClick={() => someHeadingsEnabled && setOpen(!isOpen)}
        >
          {LABELS[selected]}
        </Button>
      </Menu.Trigger>
      <Menu.List testId="dropdown-heading-list">
        {' '}
        {Object.keys(LABELS)
          .map(
            (nodeType) =>
              nodeTypesByEnablement[nodeType] && (
                <Menu.Item
                  key={nodeType}
                  isInitiallyFocused={selected === nodeType}
                  onClick={handleOnSelectItem(nodeType as BLOCKS)}
                  testId={`dropdown-option-${nodeType}`}
                  disabled={props.isDisabled}
                >
                  <span className={cx(styles.dropdown.root, styles.dropdown[nodeType])}>
                    {LABELS[nodeType]}
                  </span>
                </Menu.Item>
              )
          )
          .filter(Boolean)}
      </Menu.List>
    </Menu>
  );
}
