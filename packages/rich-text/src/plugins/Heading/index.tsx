import * as React from 'react';
import * as Slate from 'slate-react';
import { css, cx } from 'emotion';
import {
  Dropdown,
  DropdownList,
  DropdownListItem,
  Button,
} from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { Editor, Transforms, Element, Location, Range, Node } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import { CustomEditor, CustomElement } from '../../types';
import { useCustomEditor } from '../../hooks/useCustomEditor';

const styles = {
  dropdown: {
    root: css`
      font-weight: ${tokens.fontWeightDemiBold};
    `,
    [BLOCKS.PARAGRAPH]: css`
      font-size: ${tokens.fontSizeL};
    `,
    [BLOCKS.HEADING_1]: css`
      font-size: 1.625rem;
    `,
    [BLOCKS.HEADING_2]: css`
      font-size: 1.4375rem;
    `,
    [BLOCKS.HEADING_3]: css`
      font-size: 1.25rem;
    `,
    [BLOCKS.HEADING_4]: css`
      font-size: 1.125rem;
    `,
    [BLOCKS.HEADING_5]: css`
      font-size: 1rem;
    `,
    [BLOCKS.HEADING_6]: css`
      font-size: 0.875rem;
    `,
  },
  headings: {
    root: css`
      font-weight: ${tokens.fontWeightMedium};
      line-height: 1.3;
      margin: 0 0 ${tokens.spacingS};
    `,
    [BLOCKS.HEADING_1]: css`
      font-size: 1.875rem;
    `,
    [BLOCKS.HEADING_2]: css`
      font-size: 1.5625rem;
    `,
    [BLOCKS.HEADING_3]: css`
      font-size: 1.375rem;
    `,
    [BLOCKS.HEADING_4]: css`
      font-size: 1.25rem;
    `,
    [BLOCKS.HEADING_5]: css`
      font-size: 1.125rem;
    `,
    [BLOCKS.HEADING_6]: css`
      font-size: 1rem;
    `,
  },
};

export function withHeadingEvents(editor: CustomEditor, event: KeyboardEvent) {
  if (!editor.selection) return;

  // Enter a new line on a heading element
  const headings: string[] = [
    BLOCKS.HEADING_1,
    BLOCKS.HEADING_2,
    BLOCKS.HEADING_3,
    BLOCKS.HEADING_4,
    BLOCKS.HEADING_5,
    BLOCKS.HEADING_6,
  ];
  const [currentFragment] = Editor.fragment(editor, editor.selection.focus.path) as CustomElement[];
  const isEnter = event.keyCode === 13;
  const isCurrentFragmentAHeading = headings.includes(currentFragment.type);

  if (isEnter && isCurrentFragmentAHeading) {
    event.preventDefault();

    const text = { text: '' };
    const paragraph = { type: BLOCKS.PARAGRAPH, children: [text] };
    const heading = { type: currentFragment.type, children: [text] };

    if (editor.hasSelectionText()) {
      const currentOffset = editor.selection.focus.offset;
      const currentTextLength = Node.string(currentFragment).length;
      const cursorIsAtTheBeginning = currentOffset === 0;
      const cursorIsAtTheEnd = currentTextLength === currentOffset;

      if (cursorIsAtTheBeginning) {
        Transforms.insertNodes(editor, paragraph, { at: editor.selection });
      } else if (cursorIsAtTheEnd) {
        Transforms.insertNodes(editor, paragraph);
      } else {
        // Otherwise the cursor is in the middle
        Transforms.splitNodes(editor);
        Transforms.setNodes(editor, paragraph);
      }
    } else {
      Transforms.setNodes(editor, paragraph);
      Transforms.insertNodes(editor, heading);
    }
  }

  // Toggle heading blocks when pressing cmd/ctrl+alt+1|2|3|4|5|6
  const headingKeyCodes = {
    49: BLOCKS.HEADING_1,
    50: BLOCKS.HEADING_2,
    51: BLOCKS.HEADING_3,
    52: BLOCKS.HEADING_4,
    53: BLOCKS.HEADING_5,
    54: BLOCKS.HEADING_6,
  };
  const isMod = event.ctrlKey || event.metaKey;
  const isAltOrOption = event.altKey;
  const headingKey = headingKeyCodes[event.keyCode];

  if (isMod && isAltOrOption && headingKey) {
    event.preventDefault();

    editor.toggleBlock(headingKey);
  }
}

const LABELS = {
  [BLOCKS.PARAGRAPH]: 'Normal text',
  [BLOCKS.HEADING_1]: 'Heading 1',
  [BLOCKS.HEADING_2]: 'Heading 2',
  [BLOCKS.HEADING_3]: 'Heading 3',
  [BLOCKS.HEADING_4]: 'Heading 4',
  [BLOCKS.HEADING_5]: 'Heading 5',
  [BLOCKS.HEADING_6]: 'Heading 6',
};

export function ToolbarHeadingButton() {
  const editor = useCustomEditor();
  const [isOpen, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>(BLOCKS.PARAGRAPH);

  React.useEffect(() => {
    if (!editor.selection) return;

    const [element] = editor.getElementFromCurrentSelection();

    setSelected(element ? (element as CustomElement).type : BLOCKS.PARAGRAPH);
  }, [editor.selection]); // eslint-disable-line

  function handleOnSelectItem(type: string): void {
    if (!editor.selection) return;

    setSelected(type);
    setOpen(false);
    editor.toggleBlock(type);
    Slate.ReactEditor.focus(editor);
  }

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      toggleElement={
        <Button size="small" buttonType="naked" indicateDropdown onClick={() => setOpen(!isOpen)}>
          {LABELS[selected]}
        </Button>
      }>
      <DropdownList>
        {Object.keys(LABELS).map((key) => (
          <DropdownListItem
            key={key}
            isActive={selected === key}
            onClick={() => handleOnSelectItem(key)}>
            <span className={cx(styles.dropdown.root, styles.dropdown[key])}>{LABELS[key]}</span>
          </DropdownListItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
}

export function createHeading(Tag, block: BLOCKS) {
  return function Heading(props: Slate.RenderElementProps) {
    return (
      <Tag {...props.attributes} className={cx(styles.headings.root, styles.headings[block])}>
        {props.children}
      </Tag>
    );
  };
}

export const H1 = createHeading('h1', BLOCKS.HEADING_1);
export const H2 = createHeading('h2', BLOCKS.HEADING_2);
export const H3 = createHeading('h3', BLOCKS.HEADING_3);
export const H4 = createHeading('h4', BLOCKS.HEADING_4);
export const H5 = createHeading('h1', BLOCKS.HEADING_5);
export const H6 = createHeading('h1', BLOCKS.HEADING_6);
