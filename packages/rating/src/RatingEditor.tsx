import * as React from 'react';
import get from 'lodash/get';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { FieldAPI, ParametersAPI, FieldConnector } from '@contentful/field-editor-shared';
import { TextLink } from '@contentful/forma-36-react-components';
import { RatingRibbon } from './RatingRibbon';

export interface RatingEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  field: FieldAPI;

  parameters?: ParametersAPI & {
    instance: {
      stars?: number;
    };
  };
}

const styles = {
  root: css({
    marginTop: tokens.spacingS,
    display: 'flex',
    flexDirection: 'row'
  }),
  clearBtn: css({
    marginLeft: tokens.spacingM
  })
};

function isValidCount(count?: string | number): count is number {
  return typeof count === 'number' && !isNaN(count) && count > 0;
}

function getStarCount(count?: number | string): number {
  const defaultValue = 5;

  if (isValidCount(count)) {
    return Math.round(count);
  } else if (typeof count === 'string') {
    const parsed = parseInt(count, 10);
    return isValidCount(parsed) ? Math.round(parsed) : defaultValue;
  } else {
    return defaultValue;
  }
}

export function RatingEditor(props: RatingEditorProps) {
  const { field } = props;

  const starsCount = getStarCount(get(props.parameters, ['instance', 'stars']));

  return (
    <FieldConnector<number>
      throttle={0}
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ disabled, value, setValue }) => {
        const clearOption = () => {
          setValue(null);
        };

        return (
          <div data-test-id="rating-editor" className={styles.root}>
            <RatingRibbon
              disabled={disabled}
              value={value}
              stars={starsCount}
              onSelect={num => {
                setValue(num);
              }}
            />
            {value !== undefined && !disabled && (
              <TextLink
                testId="rating-editor-clear"
                className={styles.clearBtn}
                onClick={clearOption}>
                Clear
              </TextLink>
            )}
          </div>
        );
      }}
    </FieldConnector>
  );
}

RatingEditor.defaultProps = {
  isInitiallyDisabled: true
};
