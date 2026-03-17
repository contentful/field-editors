import * as React from 'react';

import '@testing-library/jest-dom/extend-expect';
import { configure, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MarkdownToolbar } from './MarkdownToolbar';

configure({
  testIdAttribute: 'data-test-id',
});

const createProps = () => ({
  canUploadAssets: true,
  disabled: false,
  mode: 'default' as const,
  actions: {
    headings: {
      h1: jest.fn(),
      h2: jest.fn(),
      h3: jest.fn(),
    },
    simple: {
      bold: jest.fn(),
      italic: jest.fn(),
      quote: jest.fn(),
      ol: jest.fn(),
      ul: jest.fn(),
      strike: jest.fn(),
      code: jest.fn(),
      hr: jest.fn(),
      indent: jest.fn(),
      dedent: jest.fn(),
    },
    history: {
      undo: jest.fn(),
      redo: jest.fn(),
    },
    insertLink: jest.fn(),
    insertSpecialCharacter: jest.fn(),
    insertTable: jest.fn(),
    organizeLinks: jest.fn(),
    embedExternalContent: jest.fn(),
    linkExistingMedia: jest.fn(),
    addNewMedia: jest.fn(),
    openZenMode: jest.fn(),
    closeZenMode: jest.fn(),
  },
});

describe('MarkdownToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens the heading menu and calls the selected heading action', async () => {
    const props = createProps();
    render(<MarkdownToolbar {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'Headings' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Heading 1' }));

    expect(props.actions.headings.h1).toHaveBeenCalledTimes(1);
  });

  it('toggles additional actions and exposes the expanded state', async () => {
    const props = createProps();
    render(<MarkdownToolbar {...props} />);

    const toggle = screen.getByRole('button', { name: 'More actions' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);

    expect(screen.getByRole('button', { name: 'Hide additional actions' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('triggers a toolbar action once per click', async () => {
    const props = createProps();
    render(<MarkdownToolbar {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'Bold' }));

    expect(props.actions.simple.bold).toHaveBeenCalledTimes(1);
  });

  it('still supports keyboard-style activation', async () => {
    const props = createProps();
    render(<MarkdownToolbar {...props} />);

    const bold = screen.getByRole('button', { name: 'Bold' });
    bold.focus();
    await userEvent.keyboard('{Enter}');

    expect(props.actions.simple.bold).toHaveBeenCalledTimes(1);
  });
});
