import React, { Component, FocusEventHandler, FocusEvent } from 'react';
// eslint-disable-next-line no-restricted-imports
import moment from 'moment';
import { TextInput } from '@contentful/forma-36-react-components';
import { css, cx } from 'emotion';
import { formatDateDisplay } from './utils/date';
import { createPikaday } from './utils/createPikaday';
import { CalendarIcon } from './icons/CalendarIcon';

const styles = {
  datePickerWrapper: css({
    display: 'inline-block',
    position: 'relative',
    maxHeight: 70
  }),
  datePicker: css({
    zIndex: 1002,
    display: 'block',
    '.is-hidden': {
      display: 'none'
    }
  }),
  input: css({
    width: '270px',
    input: {
      cursor: 'pointer',
      paddingRight: '40px'
    }
  }),
  icon: css({
    cursor: 'pointer',
    zIndex: 50,
    position: 'absolute',
    top: '12px',
    right: '12px'
  })
};

export type DatePickerProps = {
  value?: moment.Moment;
  onChange: (val: moment.Moment | null) => void;
  onBlur: FocusEventHandler;
  disabled?: boolean;
};

export class DatepickerInput extends Component<DatePickerProps> {
  static defaultProps: Partial<DatePickerProps> = {
    onChange: () => {},
    onBlur: () => {}
  };

  pikaday?: Pikaday;
  datePickerNode = React.createRef<HTMLInputElement>();

  componentDidMount() {
    const onChange = this.props.onChange;
    this.pikaday = createPikaday({
      field: this.datePickerNode && this.datePickerNode.current,
      position: 'bottom left',
      reposition: false,
      theme: cx(styles.datePicker, 'hide-carret'),
      toString: date => {
        return formatDateDisplay(moment(date));
      },
      // we need to keep this function like this
      // so `this` refers to pikaday instance
      onSelect: function onSelect() {
        onChange(this.getMoment());
      }
    });
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
          testId="date-input"
          readOnly
          disabled={this.props.disabled}
          value={formatDateDisplay(this.props.value)}
          inputRef={this.datePickerNode}
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
