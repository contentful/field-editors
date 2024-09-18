/* eslint-disable */

import _ from 'lodash';
import { Block, Mark, Inline, Text } from '@contentful/rich-text-types';
import { Validation } from '../validation';

export function enabledMarks(params: string[]): Validation {
  if (!_.isArray(params)) {
    throw new Error('Expected Array<String> as marks validation argument');
  }

  const test = function hasOnlyEnabledMarks(rootNode: Block | Inline | Text): boolean {
    const isInvalid = (mark: Mark): boolean => !params.includes(mark.type);
    const anyInvalid = (marks: Mark[]): Mark | undefined => _.find(marks, isInvalid);
    const childNodeList = (rootNode as Block | Inline).content || [];

    for (const childNode of childNodeList) {
      if (anyInvalid((childNode as Text).marks) || !hasOnlyEnabledMarks(childNode)) {
        return false;
      }
    }
    return true;
  };

  return Validation.fromTestFunction('enabledMarks', test);
}
