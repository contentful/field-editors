import * as React from 'react';
import { css } from 'emotion';
import { IconButton } from '@contentful/forma-36-react-components';

type RatingRibbonProps = {
  disabled: boolean;
  stars: number;
  value: number | null | undefined;
  onSelect: (val: number) => void;
};

type RatingRibbonState = {
  hovered: null | number;
};

export class RatingRibbon extends React.Component<RatingRibbonProps, RatingRibbonState> {
  state = {
    hovered: null,
  };

  isSelected = (num: number) => {
    const hovered = this.state.hovered;
    const value = this.props.value;

    if (hovered !== null) {
      return num <= hovered;
    }
    if (value) {
      return num <= value;
    }
    return false;
  };

  onBlur = () => {
    if (!this.props.disabled) {
      this.setState({ hovered: null });
    }
  };

  onFocus = (num: number) => () => {
    if (!this.props.disabled) {
      this.setState({ hovered: num });
    }
  };

  render() {
    const items: number[] = [];
    for (let i = 1; i <= this.props.stars; i++) {
      items.push(i);
    }

    return (
      <>
        {items.map((num) => (
          <IconButton
            data-selected={this.isSelected(num) ? 'true' : 'false'}
            testId="rating-editor-star"
            disabled={this.props.disabled}
            key={num}
            iconProps={{ icon: 'Star', className: css({ width: '22px', height: '22px' }) }}
            buttonType={this.isSelected(num) ? 'primary' : 'muted'}
            onClick={() => {
              this.props.onSelect(num);
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.keyCode === 13) {
                this.props.onSelect(num);
              }
            }}
            onMouseOver={this.onFocus(num)}
            onMouseLeave={this.onBlur}
            onFocus={this.onFocus(num)}
            onBlur={this.onBlur}
            label={num.toString()}
          />
        ))}
      </>
    );
  }
}
