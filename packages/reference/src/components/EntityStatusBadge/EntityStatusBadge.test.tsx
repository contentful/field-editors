import React from 'react';

import { ScheduledAction } from '@contentful/app-sdk';
import { act, configure, render, screen, waitFor } from '@testing-library/react';
import { EntryProps } from 'contentful-management';
import { describe, expect, test, vi } from 'vitest';

import { UseScheduledActionsProps } from '../ScheduledIconWithTooltip/ScheduledIconWithTooltip';
import { EntityStatusBadge } from './EntityStatusBadge';

configure({ testIdAttribute: 'data-test-id' });

const entity = { sys: { id: 'entry-id' } } as EntryProps;

function createGetScheduledActions() {
  return vi.fn<UseScheduledActionsProps['getEntityScheduledActions']>().mockResolvedValue([]);
}

describe('EntityStatusBadge', () => {
  test.each([
    ['undefined', undefined],
    ['null', null],
    ['missing sys', {} as EntryProps],
    ['undefined sys', { sys: undefined } as unknown as EntryProps],
    ['missing id', { sys: {} } as EntryProps]
  ])('renders the supplied status without fetching scheduled actions for %s', (_, entity) => {
    const getEntityScheduledActions = createGetScheduledActions();

    render(
      <EntityStatusBadge
        entity={entity}
        status="published"
        entityType="Entry"
        getEntityScheduledActions={getEntityScheduledActions}
      />
    );

    expect(screen.getByText('published')).toBeInTheDocument();
    expect(getEntityScheduledActions).not.toHaveBeenCalled();
  });

  test('handles an entity loading, disappearing and loading again', async () => {
    const getEntityScheduledActions = createGetScheduledActions();
    const props = {
      status: 'draft' as const,
      entityType: 'Entry' as const,
      getEntityScheduledActions
    };
    const { rerender } = render(<EntityStatusBadge {...props} />);

    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(getEntityScheduledActions).not.toHaveBeenCalled();

    await act(async () => {
      rerender(<EntityStatusBadge {...props} entity={entity} />);
    });
    expect(getEntityScheduledActions).toHaveBeenCalledWith('Entry', 'entry-id');

    rerender(<EntityStatusBadge {...props} entity={null} />);
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(getEntityScheduledActions).toHaveBeenCalledTimes(1);

    await act(async () => {
      rerender(<EntityStatusBadge {...props} entity={entity} />);
    });
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(getEntityScheduledActions).toHaveBeenCalledTimes(2);
  });

  test('still shows scheduled actions for a loaded entity', async () => {
    const job = {
      sys: { id: 'scheduled-action-id' },
      action: 'publish',
      scheduledFor: { datetime: '2030-01-01T12:00:00.000Z' }
    } as ScheduledAction;
    const getEntityScheduledActions = createGetScheduledActions().mockResolvedValue([job]);

    render(
      <EntityStatusBadge
        entity={entity}
        status="draft"
        entityType="Entry"
        getEntityScheduledActions={getEntityScheduledActions}
      />
    );

    expect(await screen.findByTestId('schedule-icon')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(getEntityScheduledActions).toHaveBeenCalledWith('Entry', 'entry-id');
  });

  test('still shows the status when fetching scheduled actions fails', async () => {
    const getEntityScheduledActions = createGetScheduledActions().mockRejectedValue(
      new Error('Unavailable')
    );

    render(
      <EntityStatusBadge
        entity={entity}
        status="archived"
        entityType="Entry"
        getEntityScheduledActions={getEntityScheduledActions}
      />
    );

    await waitFor(() => expect(getEntityScheduledActions).toHaveBeenCalledOnce());
    expect(screen.getByText('archived')).toBeInTheDocument();
  });
});
