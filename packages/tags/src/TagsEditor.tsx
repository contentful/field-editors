import React, { useState, useCallback } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

import { Pill, TextInput } from '@contentful/f36-components';
import { DragIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import arrayMove from 'array-move';
import { css, cx } from 'emotion';
import noop from 'lodash/noop';

import { TagsEditorConstraints } from './TagsEditorConstraints';
import { ConstraintsType, Constraint } from './types';

export interface TagsEditorProps {
  items: string[];
  isDisabled: boolean;
  hasError: boolean;
  constraintsType?: ConstraintsType;
  constraints?: Constraint;
  onUpdate: (items: string[]) => void;
}

const styles = {
  dropContainer: css({
    whiteSpace: 'nowrap',
    display: 'flex',
    flexWrap: 'wrap',
  }),
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
  handle: css({
    lineHeight: '1.5rem',
    padding: '0.375rem 0.625rem',
    paddingRight: 0,
    cursor: 'grab',
    userSelect: 'none',
    svg: {
      fill: tokens.gray500,
      verticalAlign: 'middle',
    },
  }),
};

const SortablePillHandle = SortableHandle((props: { isDisabled: boolean }) => (
  <div className={cx(styles.handle, { [styles.pillDisabled]: props.isDisabled })}>
    <DragIcon variant="muted" />
  </div>
));

interface SortablePillProps {
  label: string;
  onRemove: Function;
  isSortablePillDisabled: boolean;
  index: number;
}

const SortablePill = SortableElement((props: SortablePillProps) => (
  <Pill
    testId="tag-editor-pill"
    className={cx(styles.pill, { [styles.pillDisabled]: props.isSortablePillDisabled })}
    label={props.label}
    onClose={() => {
      if (!props.isSortablePillDisabled) {
        props.onRemove(props.index);
      }
    }}
    onDrag={noop}
    dragHandleComponent={<SortablePillHandle isDisabled={props.isSortablePillDisabled} />}
  />
));

interface SortableListProps {
  children: React.ReactNode;
}

const SortableList = SortableContainer((props: SortableListProps) => (
  <div className={styles.dropContainer}>{props.children}</div>
));

export function TagsEditor(props: TagsEditorProps) {
  console.log(props);

  const [pendingValue, setPendingValue] = useState('');

  const { isDisabled, items, constraints, constraintsType, hasError } = props;

  const removeItem = useCallback(
    (index) => {
      const newItems = props.items.filter((_, filterIndex) => index !== filterIndex);
      props.onUpdate(newItems);
    },
    [props]
  );

  const swapItems = useCallback(
    ({ oldIndex, newIndex }) => {
      const newItems = arrayMove(props.items, oldIndex, newIndex);
      props.onUpdate(newItems);
    },
    [props]
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
            props.onUpdate([...props.items, pendingValue]);
            setPendingValue('');
          }
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setPendingValue(e.target.value);
        }}
      />
      <SortableList
        useDragHandle
        axis="xy"
        distance={10}
        onSortEnd={({ oldIndex, newIndex }) => {
          swapItems({ oldIndex, newIndex });
        }}
      >
        {items.map((item, index) => {
          return (
            <SortablePill
              label={item}
              index={index}
              key={item + index}
              disabled={isDisabled}
              /**
               * `isSortablePillDisabled` is needed as SortableElement
               * from react-sortable-hoc doesn't pass down the disabled prop.
               * See: https://github.com/clauderic/react-sortable-hoc/issues/612
               */
              isSortablePillDisabled={isDisabled}
              onRemove={() => {
                removeItem(index);
              }}
            />
          );
        })}
      </SortableList>
      {constraints && constraintsType && (
        <TagsEditorConstraints constraints={constraints} constraintsType={constraintsType} />
      )}
    </div>
  );
}
