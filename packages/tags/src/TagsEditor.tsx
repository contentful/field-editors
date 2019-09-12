import React, { useState } from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { TextInput, Pill, Icon } from '@contentful/forma-36-react-components';
import { TagsEditorConstraints } from './TagsEditorConstraints';
import { ConstraintsType, Constraint } from './types';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';

const noop = () => {};

interface TagsEditorProps {
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
    flexWrap: 'wrap'
  }),
  input: css({
    marginTop: tokens.spacingS,
    marginBottom: tokens.spacingM
  }),
  pill: css({
    marginRight: tokens.spacingS,
    marginBottom: tokens.spacingS
  }),
  handle: css({
    lineHeight: '1.5rem',
    padding: '0.375rem 0.625rem',
    paddingRight: 0,
    cursor: 'grab',
    userSelect: 'none',
    svg: {
      fill: tokens.colorTextLightest,
      verticalAlign: 'middle'
    }
  })
};

const SortablePillHandle = SortableHandle(() => (
  <div className={styles.handle}>
    <Icon icon="Drag" color="muted" />
  </div>
));

interface SortablePillProps {
  label: string;
  onRemove: Function;
  disabled: boolean;
  index: number;
}

const SortablePill = SortableElement((props: SortablePillProps) => (
  <Pill
    testId="tag-editor-pill"
    className={styles.pill}
    label={props.label}
    onClose={() => {
      if (!props.disabled) {
        props.onRemove(props.index);
      }
    }}
    onDrag={noop}
    dragHandleComponent={<SortablePillHandle />}
  />
));

interface SortableListProps {
  children: React.ReactNode;
}

const SortableList = SortableContainer((props: SortableListProps) => (
  <div className={styles.dropContainer}>{props.children}</div>
));

export function TagsEditor(props: TagsEditorProps) {
  const [value, setValue] = useState('');

  const { isDisabled, items, constraints, constraintsType, hasError } = props;

  return (
    <div data-test-id="tag-editor-container">
      <TextInput
        testId="tag-editor-input"
        className={styles.input}
        disabled={isDisabled}
        error={hasError}
        type="text"
        value={value}
        placeholder="Type the value and hit enter"
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (value && e.keyCode === 13) {
            props.onUpdate([...props.items, value]);
            setValue('');
          }
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
        }}
      />
      <SortableList
        useDragHandle
        axis="xy"
        distance={10}
        onSortEnd={({ oldIndex, newIndex }) => {
          props.onUpdate(arrayMove(props.items, oldIndex, newIndex));
        }}>
        {items.map((item, index) => {
          return (
            <SortablePill
              label={item}
              index={index}
              key={item + index}
              disabled={isDisabled}
              onRemove={() => {
                props.onUpdate(props.items.filter((_, filterIndex) => index !== filterIndex));
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
