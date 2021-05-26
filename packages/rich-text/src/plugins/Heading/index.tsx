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
import { Editor, Transforms, Element as SlateElement, Text } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';

const LABELS = {
  [BLOCKS.PARAGRAPH]: 'Normal text',
  [BLOCKS.HEADING_1]: 'Heading 1',
  [BLOCKS.HEADING_2]: 'Heading 2',
  [BLOCKS.HEADING_3]: 'Heading 3',
  [BLOCKS.HEADING_4]: 'Heading 4',
  [BLOCKS.HEADING_5]: 'Heading 5',
  [BLOCKS.HEADING_6]: 'Heading 6',
};

const LIST_TYPES = [BLOCKS.OL_LIST, BLOCKS.UL_LIST];

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });

  return !!match;
};

const toggleBlock = (editor, type) => {
  const isActive = isBlockActive(editor, type);
  const isList = LIST_TYPES.includes(type);

  Transforms.unwrapNodes(editor, {
    match: (n) => LIST_TYPES.includes(!Editor.isEditor(n) && SlateElement.isElement(n) && n.type),
    split: true,
  });
  const newProperties: Partial<SlateElement> = {
    type: isActive ? BLOCKS.PARAGRAPH : isList ? BLOCKS.LIST_ITEM : type,
  };
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

function hasSelectionText(editor) {
  return editor.selection
    ? Editor.node(editor, editor.selection.focus.path).some(
        (node) => Text.isText(node) && node.text !== ''
      )
    : false;
}

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

export function withHeadingEvents(editor, event: KeyboardEvent) {
  const headings = [
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

    if (hasSelectionText(editor)) {
      Transforms.insertNodes(editor, { type: BLOCKS.PARAGRAPH, children: [{ text: '' }] });
    } else {
      Transforms.setNodes(editor, { type: BLOCKS.PARAGRAPH, children: [{ text: '' }] });
      Transforms.insertNodes(editor, { type: currentFragment.type, children: [{ text: '' }] });
    }
  }
}

export function ToolbarHeadingButton() {
  const editor = Slate.useSlateStatic();
  const [isOpen, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(BLOCKS.PARAGRAPH);

  React.useEffect(() => {
    if (!editor.selection) return;

    const [element] = Array.from(
      Editor.nodes(editor, {
        at: editor.selection.focus,
        match: (node) => SlateElement.isElement(node),
      })
    ).flat();

    setSelected(element.type ?? BLOCKS.PARAGRAPH);
  }, [editor.selection]); // eslint-disable-line

  function handleOnSelectItem(type: BLOCKS): void {
    if (!editor.selection) return;

    setSelected(type);
    setOpen(false);

    toggleBlock(editor, type);

    Slate.ReactEditor.focus(editor);
  }

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      toggleElement={
        <Button
          size="small"
          buttonType="naked"
          indicateDropdown
          // disabled={!editor.selection}
          onClick={() => setOpen(!isOpen)}>
          {LABELS[selected]}
        </Button>
      }>
      <DropdownList>
        <DropdownListItem
          isActive={selected === BLOCKS.PARAGRAPH}
          onClick={() => handleOnSelectItem(BLOCKS.PARAGRAPH)}>
          <span className={cx(styles.dropdown.root, styles.dropdown[BLOCKS.PARAGRAPH])}>
            Normal text
          </span>
        </DropdownListItem>
        <DropdownListItem
          isActive={selected === BLOCKS.HEADING_1}
          onClick={() => handleOnSelectItem(BLOCKS.HEADING_1)}>
          <span className={cx(styles.dropdown.root, styles.dropdown[BLOCKS.HEADING_1])}>
            Heading 1
          </span>
        </DropdownListItem>
        <DropdownListItem
          isActive={selected === BLOCKS.HEADING_2}
          onClick={() => handleOnSelectItem(BLOCKS.HEADING_2)}>
          <span className={cx(styles.dropdown.root, styles.dropdown[BLOCKS.HEADING_2])}>
            Heading 2
          </span>
        </DropdownListItem>
        <DropdownListItem
          isActive={selected === BLOCKS.HEADING_3}
          onClick={() => handleOnSelectItem(BLOCKS.HEADING_3)}>
          <span className={cx(styles.dropdown.root, styles.dropdown[BLOCKS.HEADING_3])}>
            Heading 3
          </span>
        </DropdownListItem>
        <DropdownListItem
          isActive={selected === BLOCKS.HEADING_4}
          onClick={() => handleOnSelectItem(BLOCKS.HEADING_4)}>
          <span className={cx(styles.dropdown.root, styles.dropdown[BLOCKS.HEADING_4])}>
            Heading 4
          </span>
        </DropdownListItem>
        <DropdownListItem
          isActive={selected === BLOCKS.HEADING_5}
          onClick={() => handleOnSelectItem(BLOCKS.HEADING_5)}>
          <span className={cx(styles.dropdown.root, styles.dropdown[BLOCKS.HEADING_5])}>
            Heading 5
          </span>
        </DropdownListItem>
        <DropdownListItem
          isActive={selected === BLOCKS.HEADING_6}
          onClick={() => handleOnSelectItem(BLOCKS.HEADING_6)}>
          <span className={cx(styles.dropdown.root, styles.dropdown[BLOCKS.HEADING_6])}>
            Heading 6
          </span>
        </DropdownListItem>
      </DropdownList>
    </Dropdown>
  );
}

export function H1(props: Slate.RenderElementProps) {
  return (
    <h1
      {...props.attributes}
      className={cx(styles.headings.root, styles.headings[BLOCKS.HEADING_1])}>
      {props.children}
    </h1>
  );
}

export function H2(props: Slate.RenderElementProps) {
  return (
    <h2
      {...props.attributes}
      className={cx(styles.headings.root, styles.headings[BLOCKS.HEADING_2])}>
      {props.children}
    </h2>
  );
}

export function H3(props: Slate.RenderElementProps) {
  return (
    <h3
      {...props.attributes}
      className={cx(styles.headings.root, styles.headings[BLOCKS.HEADING_3])}>
      {props.children}
    </h3>
  );
}

export function H4(props: Slate.RenderElementProps) {
  return (
    <h4
      {...props.attributes}
      className={cx(styles.headings.root, styles.headings[BLOCKS.HEADING_4])}>
      {props.children}
    </h4>
  );
}

export function H5(props: Slate.RenderElementProps) {
  return (
    <h5
      {...props.attributes}
      className={cx(styles.headings.root, styles.headings[BLOCKS.HEADING_5])}>
      {props.children}
    </h5>
  );
}

export function H6(props: Slate.RenderElementProps) {
  return (
    <h6
      {...props.attributes}
      className={cx(styles.dropdown.root, styles.dropdown[BLOCKS.HEADING_6])}>
      {props.children}
    </h6>
  );
}
