import * as React from 'react';

import { configure, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MarkdownToolbar } from './MarkdownToolbar';

configure({
  testIdAttribute: 'data-test-id',
});

const createProps = () => ({
  canUploadAssets: true,
  disabled: false,
  indentationDisabled: false,
  mode: 'default' as const,
  actions: {
    headings: {
      h1: vi.fn(),
      h2: vi.fn(),
      h3: vi.fn(),
    },
    simple: {
      bold: vi.fn(),
      italic: vi.fn(),
      quote: vi.fn(),
      ol: vi.fn(),
      ul: vi.fn(),
      strike: vi.fn(),
      code: vi.fn(),
      hr: vi.fn(),
      indent: vi.fn(),
      dedent: vi.fn(),
    },
    history: {
      undo: vi.fn(),
      redo: vi.fn(),
    },
    insertLink: vi.fn(),
    insertSpecialCharacter: vi.fn(),
    insertTable: vi.fn(),
    organizeLinks: vi.fn(),
    embedExternalContent: vi.fn(),
    linkExistingMedia: vi.fn(),
    addNewMedia: vi.fn(),
    openZenMode: vi.fn(),
    closeZenMode: vi.fn(),
  },
});

describe('MarkdownToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('disables indentation controls when indentation is unavailable', async () => {
    const props = { ...createProps(), indentationDisabled: true };
    render(<MarkdownToolbar {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'More actions' }));

    expect(screen.getByRole('button', { name: 'Increase indentation' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease indentation' })).toBeDisabled();
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
