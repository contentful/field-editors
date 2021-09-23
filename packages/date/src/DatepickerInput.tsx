import React, { Component, FocusEventHandler, FocusEvent } from 'react';
import noop from 'lodash/noop';
// eslint-disable-next-line no-restricted-imports
import moment from 'moment';
import { css, cx } from 'emotion';
import { formatDateDisplay } from './utils/date';
import { createPikaday } from './utils/createPikaday';
import { CalendarIcon } from './icons/CalendarIcon';

import { TextInput } from '@contentful/f36-components';

const styles = {
  datePickerWrapper: css({
    position: 'relative',
    maxHeight: 70,
  }),
  datePicker: css({
    zIndex: 1002,
    display: 'block',
    '.is-hidden': {
      display: 'none',
    },
  }),
  input: css({
    width: '270px',
    input: {
      cursor: 'pointer',
      paddingRight: '40px',
      '&:disabled': {
        cursor: 'not-allowed',
      },
    },
  }),
  icon: css({
    cursor: 'pointer',
    zIndex: 50,
    position: 'absolute',
    top: '12px',
    right: '12px',
  }),
};

export type DatePickerProps = {
  value?: moment.Moment;
  onChange: (val: moment.Moment | undefined) => void;
  onBlur: FocusEventHandler;
  disabled?: boolean;
};

export class DatepickerInput extends Component<DatePickerProps> {
  static defaultProps: Partial<DatePickerProps> = {
    onChange: noop,
    onBlur: noop,
  };

  pikaday?: Pikaday;
  datePickerNode = React.createRef<HTMLInputElement>();

  componentDidMount() {
    const onChange = this.props.onChange;
    setTimeout(() => {
      const defaultDate = this.props.value ? this.props.value.toDate() : undefined;
      this.pikaday = createPikaday({
        field: this.datePickerNode && this.datePickerNode.current,
        defaultDate,
        setDefaultDate: defaultDate !== undefined,
        position: 'bottom left',
        reposition: false,
        theme: cx(styles.datePicker, 'hide-carret'),
        toString: (date) => {
          return formatDateDisplay(moment(date));
        },
        // we need to keep this function like this
        // so `this` refers to pikaday instance
        onSelect: function onSelect() {
          onChange(this.getMoment() || undefined);
        },
      });
    }, 100);
  }

  focusInput = () => {
    if (this.datePickerNode && this.datePickerNode.current) {
      this.datePickerNode.current.focus();
    }
  };

  componentWillUnmount() {
    if (this.pikaday) {
      this.pikaday.destroy();
    }
  }

  handleOpen = () => {
    if (this.pikaday) {
      this.pikaday.show();
    }
  };

  handleBlur = (e: FocusEvent) => {
    this.props.onBlur(e);
    if (this.pikaday && !this.pikaday.el.contains(e.relatedTarget as HTMLInputElement)) {
      this.pikaday.hide();
    }
  };

  render() {
    return (
      <div className={styles.datePickerWrapper}>
        <TextInput
          aria-label="Select date"
          testId="date-input"
          isReadOnly
          isDisabled={this.props.disabled}
          value={formatDateDisplay(this.props.value)}
          ref={this.datePickerNode}
          onFocus={this.handleOpen}
          onBlur={this.handleBlur}
          className={styles.input}
        />
        <CalendarIcon
          onClick={() => {
            this.focusInput();
          }}
          className={styles.icon}
        />
      </div>
    );
  }
}
