import * as React from 'react';
import * as Slate from 'slate-react';
import { css, cx } from 'emotion';
import { Menu, Button } from '@contentful/f36-components';
import { ChevronDownIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { BLOCKS, HEADINGS } from '@contentful/rich-text-types';
import { toggleNodeType, onKeyDownToggleElement } from '@udecode/plate-core';
import { RichTextPlugin, CustomElement } from '../../types';
import {
  getElementFromCurrentSelection,
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

export const createHeadingPlugin = (): RichTextPlugin => ({
  key: 'HeadingPlugin',
  softBreak: [
    // create a new line with SHIFT+Enter inside a heading
    {
      hotkey: 'shift+enter',
      query: {
        allow: HEADINGS,
      },
    },
  ],
  plugins: HEADINGS.map((nodeType, idx) => {
    const level = idx + 1;
    const tagName = `h${level}`;

    return {
      key: nodeType,
      type: nodeType,
      isElement: true,
      component: createHeading(tagName, nodeType),
      options: {
        hotkey: [`mod+alt+${level}`],
      },
      handlers: {
        onKeyDown: onKeyDownToggleElement,
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
