import * as React from 'react';

import { IconButton } from '@contentful/f36-components';
import { StarIcon } from '@contentful/f36-icons';
import { css } from 'emotion';

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
            variant="transparent"
            size="small"
            icon={
              <StarIcon
                variant={this.isSelected(num) ? 'primary' : 'muted'}
                className={css({ width: '22px', height: '22px' })}
              />
            }
            data-selected={this.isSelected(num) ? 'true' : 'false'}
            testId="rating-editor-star"
            isDisabled={this.props.disabled}
            key={num}
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
            aria-label={num.toString()}
          />
        ))}
      </>
    );
  }
}
