import React from 'react';
import Enzyme from 'enzyme';
import 'jest-enzyme';
import { Editor } from 'slate';

import Toolbar from '..';
import ValidationType, {
  VALIDATABLE_NODE_TYPES
} from 'components/field_dialog/RichTextValidationType';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

jest.mock('ng/data/CMA/EntityState', () => ({}), { virtual: true });
jest.mock('directives/thumbnailHelpers', () => ({}), { virtual: true });

const fakeProps = () => ({
  isDisabled: false,
  editor: new Editor(),
  onChange: jest.fn(),
  richTextAPI: {
    logToolbarAction: jest.fn(),
    logShortcutAction: jest.fn(),
    logViewportAction: jest.fn(),
    widgetAPI: {
      field: {}
    }
  },
  permissions: {
    canAccessAssets: true
  }
});

const dropDownEmbedNodeTypes = [
  BLOCKS.EMBEDDED_ASSET,
  BLOCKS.EMBEDDED_ENTRY,
  INLINES.EMBEDDED_ENTRY
];

describe('Toolbar', () => {
  it('renders toolbar icons', () => {
    const toolbar = Enzyme.mount(<Toolbar {...fakeProps()} />);

    expect(toolbar.exists(`[data-test-id="toolbar-heading-toggle"]`)).toBe(true);

    expect(toolbar.exists(`[data-test-id="toolbar-toggle-bold"]`)).toBe(true);
    expect(toolbar.exists(`[data-test-id="toolbar-toggle-italic"]`)).toBe(true);
    expect(toolbar.exists(`[data-test-id="toolbar-toggle-code"]`)).toBe(true);
    expect(toolbar.exists(`[data-test-id="toolbar-toggle-underline"]`)).toBe(true);

    expect(toolbar.exists(`[data-test-id="toolbar-toggle-hyperlink"]`)).toBe(true);

    expect(toolbar.exists(`[data-test-id="toolbar-toggle-unordered-list"]`)).toBe(true);
    expect(toolbar.exists(`[data-test-id="toolbar-toggle-ordered-list"]`)).toBe(true);

    expect(toolbar.exists(`[data-test-id="toolbar-toggle-blockquote"]`)).toBe(true);

    expect(toolbar.exists(`[data-test-id="toolbar-toggle-hr"]`)).toBe(true);

    expect(toolbar.exists(`[data-test-id="toolbar-entry-dropdown-toggle"]`)).toBe(true);
  });

  it('renders no icons if no formatting options enabled', () => {
    const props = fakeProps();
    props.richTextAPI.widgetAPI.field.validations = [
      { [ValidationType.ENABLED_NODE_TYPES]: [] },
      { [ValidationType.ENABLED_MARKS]: [] }
    ];

    const toolbar = Enzyme.mount(<Toolbar {...props} />);

    expect(toolbar.exists(`[data-test-id="toolbar-heading-toggle"]`)).toBe(true);

    expect(toolbar.exists(`[data-test-id="toolbar-toggle-bold"]`)).toBe(false);
    expect(toolbar.exists(`[data-test-id="toolbar-toggle-italic"]`)).toBe(false);
    expect(toolbar.exists(`[data-test-id="toolbar-toggle-code"]`)).toBe(false);
    expect(toolbar.exists(`[data-test-id="toolbar-toggle-underline"]`)).toBe(false);

    expect(toolbar.exists(`[data-test-id="toolbar-toggle-hyperlink"]`)).toBe(false);

    expect(toolbar.exists(`[data-test-id="toolbar-toggle-unordered-list"]`)).toBe(false);
    expect(toolbar.exists(`[data-test-id="toolbar-toggle-ordered-list"]`)).toBe(false);

    expect(toolbar.exists(`[data-test-id="toolbar-toggle-blockquote"]`)).toBe(false);

    expect(toolbar.exists(`[data-test-id="toolbar-toggle-hr"]`)).toBe(false);

    expect(toolbar.exists(`[data-test-id="toolbar-entry-dropdown-toggle"]`)).toBe(false);
  });

  it('hides group separator if no marks enabled', () => {
    const props = fakeProps();
    props.richTextAPI.widgetAPI.field.validations = [{ [ValidationType.ENABLED_MARKS]: [] }];
    const toolbar = Enzyme.mount(<Toolbar {...props} />);
    expect(toolbar.find('[data-test-id="mark-divider"]')).toHaveLength(0);
  });

  it('hides group separator if no lists, quotes, or hr enabled', () => {
    const props = fakeProps();
    props.richTextAPI.widgetAPI.field.validations = [
      {
        [ValidationType.ENABLED_NODE_TYPES]: VALIDATABLE_NODE_TYPES.filter(
          nodeType => ![BLOCKS.OL_LIST, BLOCKS.UL_LIST, BLOCKS.QUOTE, BLOCKS.HR].includes(nodeType)
        )
      }
    ];
    const toolbar = Enzyme.mount(<Toolbar {...props} />);
    expect(toolbar.find('[data-test-id="list-divider"]')).toHaveLength(0);
  });

  it('hides the group separator when no hyperlinks are enabled', () => {
    const props = fakeProps();
    props.richTextAPI.widgetAPI.field.validations = [
      {
        [ValidationType.ENABLED_NODE_TYPES]: VALIDATABLE_NODE_TYPES.filter(
          nodeType =>
            ![INLINES.ASSET_HYPERLINK, INLINES.HYPERLINK, INLINES.ENTRY_HYPERLINK].includes(
              nodeType
            )
        )
      }
    ];
    const toolbar = Enzyme.mount(<Toolbar {...props} />);
    expect(toolbar.find('[data-test-id="hyperlink-divider"]')).toHaveLength(0);
  });

  it('hides the embeds dropdown when no embeds are enabled', () => {
    const props = fakeProps();
    props.richTextAPI.widgetAPI.field.validations = [
      {
        [ValidationType.ENABLED_NODE_TYPES]: VALIDATABLE_NODE_TYPES.filter(
          nodeType => !dropDownEmbedNodeTypes.includes(nodeType)
        )
      }
    ];
    const toolbar = Enzyme.mount(<Toolbar {...props} />);
    expect(toolbar.find('[data-test-id="toolbar-entry-dropdown-toggle"]')).toHaveLength(0);
  });

  it('hides embed dropdown option when no relevant embed is enabled', () => {
    for (const embedNodeType of dropDownEmbedNodeTypes) {
      const props = fakeProps();
      props.richTextAPI.widgetAPI.field.validations = [
        {
          [ValidationType.ENABLED_NODE_TYPES]: VALIDATABLE_NODE_TYPES.filter(
            nodeType => nodeType !== embedNodeType
          )
        }
      ];
      const toolbar = Enzyme.mount(<Toolbar {...props} />);
      toolbar.find('button[data-test-id="toolbar-entry-dropdown-toggle"]').simulate('mouseDown');
      expect(toolbar.find(`[data-test-id="toolbar-toggle-${embedNodeType}"]`)).toHaveLength(0);
      dropDownEmbedNodeTypes
        .filter(nodeType => nodeType !== embedNodeType)
        .forEach(nodeType => {
          expect(toolbar.find(`[data-test-id="toolbar-toggle-${nodeType}"]`)).toHaveLength(1);
        });
    }
  });

  it(`hides the ${BLOCKS.EMBEDDED_ASSET} dropdown option when the user has no asset access permissions`, () => {
    const props = fakeProps();
    props.permissions.canAccessAssets = false;
    props.richTextAPI.widgetAPI.field.validations = [
      { [ValidationType.ENABLED_NODE_TYPES]: VALIDATABLE_NODE_TYPES }
    ];
    const toolbar = Enzyme.mount(<Toolbar {...props} />);
    toolbar.find('button[data-test-id="toolbar-entry-dropdown-toggle"]').simulate('mouseDown');
    expect(toolbar.find(`[data-test-id="toolbar-toggle-${BLOCKS.EMBEDDED_ASSET}"]`)).toHaveLength(
      0
    );
    dropDownEmbedNodeTypes
      .filter(nodeType => nodeType !== BLOCKS.EMBEDDED_ASSET)
      .forEach(nodeType => {
        expect(toolbar.find(`[data-test-id="toolbar-toggle-${nodeType}"]`)).toHaveLength(1);
      });
  });
});
