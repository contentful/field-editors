import * as React from 'react';

import { TextLink, Flex } from '@contentful/f36-components';
import { FieldAPI, ParametersAPI, FieldConnector } from '@contentful/field-editor-shared';
import get from 'lodash/get';

import { RatingRibbon } from './RatingRibbon';

export interface RatingEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  /**
   * sdk.field
   */
  field: FieldAPI;

  /**
   * sdk.parameters
   */
  parameters?: ParametersAPI<Record<string, any>, { stars?: number }, Record<string, any>>;
}

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

export function RatingEditor({ field, parameters, isInitiallyDisabled = true }: RatingEditorProps) {
  const starsCount = getStarCount(get(parameters, ['instance', 'stars']));

  return (
    <FieldConnector<number> debounce={0} field={field} isInitiallyDisabled={isInitiallyDisabled}>
      {({ disabled, value, setValue }) => {
        const clearOption = () => {
          setValue(null);
        };

        return (
          <Flex testId="rating-editor" flexDirection="row" marginTop="spacingS">
            <RatingRibbon
              disabled={disabled}
              value={value}
              stars={starsCount}
              onSelect={(num) => {
                setValue(num);
              }}
            />
            {value !== undefined && !disabled && (
              <Flex marginLeft="spacingM">
                <TextLink as="button" testId="rating-editor-clear" onClick={clearOption}>
                  Clear
                </TextLink>
              </Flex>
            )}
          </Flex>
        );
      }}
    </FieldConnector>
  );
}
