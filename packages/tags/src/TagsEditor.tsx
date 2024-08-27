import React, { useCallback, useState } from 'react';

import { DragHandle, Pill, TextInput } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { css, cx } from 'emotion';
import noop from 'lodash/noop';

import { TagsEditorConstraints } from './TagsEditorConstraints';
import { Constraint, ConstraintsType } from './types';

export interface TagsEditorProps {
  items: string[];
  isDisabled: boolean;
  hasError: boolean;
  constraintsType?: ConstraintsType;
  constraints?: Constraint;
  onUpdate: (items: string[]) => void;
}

const styles = {
  input: css({
    marginTop: tokens.spacingS,
    marginBottom: tokens.spacingM,
  }),
  pill: css({
    marginRight: tokens.spacingS,
    marginBottom: tokens.spacingS,
  }),
  pillDisabled: css({
    cursor: 'not-allowed !important',
    button: {
      cursor: 'not-allowed !important',
      // instead of changing the @contentful/f36-components package
      pointerEvents: 'none',
    },
  }),
};

interface SortablePillProps {
  id: string;
  label: string;
  onRemove: Function;
  disabled: boolean;
  index: number;
}

const SortablePill = ({ id, label, index, disabled, onRemove }: SortablePillProps) => {
  const { listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: transform ? CSS.Transform.toString({ ...transform, scaleX: 1, scaleY: 1 }) : '',
    transition,
  };
  return (
    <Pill
      ref={setNodeRef}
      testId="tag-editor-pill"
      className={cx(styles.pill, { [styles.pillDisabled]: disabled })}
      style={style}
      label={label}
      onClose={() => {
        if (!disabled) {
          onRemove(index);
        }
      }}
      onDrag={noop}
      dragHandleComponent={
        <DragHandle ref={setActivatorNodeRef} variant="transparent" label="" {...listeners} />
      }
    />
  );
};

export function TagsEditor(props: TagsEditorProps) {
  const [pendingValue, setPendingValue] = useState('');

  const { isDisabled, items, constraints, constraintsType, hasError, onUpdate } = props;
  const itemsMap = React.useMemo(
    () => items.map((item, index) => ({ id: item + index, value: item })),
    [items]
  );

  const removeItem = useCallback(
    (index: number) => {
      const newItems = items.filter((_, filterIndex) => index !== filterIndex);
      onUpdate(newItems);
    },
    [items, onUpdate]
  );

  const swapItems = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (active.id !== over?.id) {
        const oldIndex = itemsMap.findIndex(({ id }) => id === active?.id);
        const newIndex = itemsMap.findIndex(({ id }) => id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onUpdate(newItems);
      }
    },
    [items, itemsMap, onUpdate]
  );

  return (
    <div data-test-id="tag-editor-container">
      <TextInput
        testId="tag-editor-input"
        className={styles.input}
        isDisabled={isDisabled}
        isInvalid={hasError}
        type="text"
        value={pendingValue}
        placeholder="Type the value and hit enter"
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (pendingValue && e.keyCode === 13) {
            onUpdate([...items, pendingValue]);
            setPendingValue('');
          }
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setPendingValue(e.target.value);
        }}
      />
      <DndContext onDragEnd={swapItems} modifiers={[restrictToParentElement]}>
        <SortableContext items={itemsMap}>
          {itemsMap.map((item, index) => (
            <SortablePill
              key={item.id}
              id={item.id}
              label={item.value}
              index={index}
              disabled={isDisabled}
              onRemove={() => removeItem(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
      {constraints && constraintsType && (
        <TagsEditorConstraints constraints={constraints} constraintsType={constraintsType} />
      )}
    </div>
  );
}
