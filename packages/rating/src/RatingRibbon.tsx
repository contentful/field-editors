import * as React from 'react';

import { IconButton } from '@contentful/f36-components';
import { StarIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { css } from '@emotion/css';

type RatingRibbonProps = {
  disabled: boolean;
  stars: number;
  value: number | null | undefined;
  onSelect: (val: number) => void;
};

export function RatingRibbon({ disabled, stars, value, onSelect }: RatingRibbonProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const isSelected = (num: number) => {
    if (hovered !== null) {
      return num <= hovered;
    }
    if (value) {
      return num <= value;
    }
    return false;
  };

  const onBlur = () => {
    if (!disabled) {
      setHovered(null);
    }
  };

  const onFocus = (num: number) => () => {
    if (!disabled) {
      setHovered(num);
    }
  };

  const items: number[] = [];
  for (let i = 1; i <= stars; i++) {
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
              isActive={isSelected(num)}
              color={isSelected(num) ? tokens.colorPrimary : tokens.gray600}
              className={css({ width: '22px', height: '22px' })}
            />
          }
          data-selected={isSelected(num) ? 'true' : 'false'}
          testId="rating-editor-star"
          isDisabled={disabled}
          key={num}
          onMouseDown={(e: React.MouseEvent) => {
            if (e.button === 0) {
              onSelect(num);
            }
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.keyCode === 13) {
              onSelect(num);
            }
          }}
          onMouseOver={onFocus(num)}
          onMouseLeave={onBlur}
          onFocus={onFocus(num)}
          onBlur={onBlur}
          aria-label={num.toString()}
        />
      ))}
    </>
  );
}
