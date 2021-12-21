import * as React from 'react';
import * as Slate from 'slate-react';
import { css, cx } from 'emotion';
import { Menu, Button } from '@contentful/f36-components';
import { ChevronDownIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { Editor, Transforms, Node } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import { PlatePlugin, PlateEditor } from '@udecode/plate-core';
import { insertNodes, setNodes, toggleNodeType } from '@udecode/plate-core';
import { CustomElement } from '../../types';
import {
  getElementFromCurrentSelection,
  hasSelectionText,
  shouldUnwrapBlockquote,
  unwrapFromRoot,
} from '../../helpers/editor';
import { isNodeTypeEnabled } from '../../helpers/validations';
import { useSdkContext } from '../../SdkProvider';
import { useContentfulEditor } from '../../ContentfulEditorProvider';

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

const HEADINGS: BLOCKS[] = [
  BLOCKS.HEADING_1,
  BLOCKS.HEADING_2,
  BLOCKS.HEADING_3,
  BLOCKS.HEADING_4,
  BLOCKS.HEADING_5,
  BLOCKS.HEADING_6,
];

export function withHeadingEvents(editor: PlateEditor) {
  return (event: React.KeyboardEvent) => {
    if (!editor.selection) return;

    // Enter a new line on a heading element
    const [currentFragment] = Editor.fragment(
      editor,
      editor.selection.focus.path
    ) as CustomElement[];
    const isEnter = event.keyCode === 13;
    const isCurrentFragmentAHeading = HEADINGS.includes(currentFragment.type as BLOCKS);

    if (isEnter && isCurrentFragmentAHeading) {
      event.preventDefault();

      const text = { text: '' };
      const paragraph = { type: BLOCKS.PARAGRAPH, data: {}, children: [text] };
      const heading = { type: currentFragment.type, data: {}, children: [text] };

      if (hasSelectionText(editor)) {
        const currentOffset = editor.selection.focus.offset;
        const currentTextLength = Node.string(currentFragment).length;
        const cursorIsAtTheBeginning = currentOffset === 0;
        const cursorIsAtTheEnd = currentTextLength === currentOffset;

        if (cursorIsAtTheBeginning) {
          insertNodes(editor, paragraph, { at: editor.selection });
        } else if (cursorIsAtTheEnd) {
          insertNodes(editor, paragraph);
        } else {
          // Otherwise the cursor is in the middle
          Transforms.splitNodes(editor);
          setNodes(editor, paragraph);
        }
      } else {
        setNodes(editor, paragraph);
        insertNodes(editor, heading);
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

      if (shouldUnwrapBlockquote(editor, headingKey)) {
        unwrapFromRoot(editor);
      }

      toggleNodeType(editor, { activeType: headingKey, inactiveType: BLOCKS.PARAGRAPH });
    }
  };
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

interface ToolbarHeadingButtonProps {
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
    const type = (element as CustomElement).type;

    setSelected(LABELS[type] ? type : BLOCKS.PARAGRAPH);
  }, [editor?.operations, editor?.selection]); // eslint-disable-line

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

      if (shouldUnwrapBlockquote(editor, type)) {
        unwrapFromRoot(editor);
      }

      toggleNodeType(editor, { activeType: type, inactiveType: type });

      // TODO: Figure out why focus only works with timeout here.
      setTimeout(() => {
        Slate.ReactEditor.focus(editor);
      }, 0);
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
          onClick={() => someHeadingsEnabled && setOpen(!isOpen)}>
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
                  disabled={props.isDisabled}>
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

export function createHeading(Tag, block: BLOCKS) {
  return function Heading(props: Slate.RenderElementProps) {
    return (
      <Tag {...props.attributes} className={cx(styles.headings.root, styles.headings[block])}>
        {props.children}
      </Tag>
    );
  };
}

export const createHeadingPlugin = (): PlatePlugin => ({
  key: 'heading',
  plugins: HEADINGS.map((nodeType, idx) => {
    const tagName = `h${idx + 1}`;

    return {
      key: nodeType,
      isElement: true,
      component: createHeading(tagName, nodeType),
      handlers: {
        onKeyDown: withHeadingEvents,
      },
      deserializeHtml: {
        rules: [
          {
            validNodeName: tagName.toUpperCase(),
          },
        ],
      },
    };
  }),
});
