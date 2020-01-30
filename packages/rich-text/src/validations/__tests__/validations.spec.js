import { isMarkEnabled, isNodeTypeEnabled } from '..';
import { MARKS, BLOCKS } from '@contentful/rich-text-types';

const fakeFieldInfo = (enabledNodeTypes, enabledMarks) => {
  const validations = [];

  if (enabledNodeTypes) {
    validations.push({
      enabledNodeTypes
    });
  }

  if (enabledMarks) {
    validations.push({
      enabledMarks
    });
  }

  return {
    validations
  };
};

describe('isMarkEnabled', () => {
  it('returns true if enabled', () => {
    const fieldInfo = fakeFieldInfo(undefined, [MARKS.BOLD]);
    expect(isMarkEnabled(fieldInfo, MARKS.BOLD)).toBe(true);
  });

  it('returns false if not enabled', () => {
    const fieldInfo = fakeFieldInfo(undefined, []);
    expect(isMarkEnabled(fieldInfo, MARKS.BOLD)).toBe(false);
  });

  it('returns true if no validations', () => {
    const fieldInfo = fakeFieldInfo(undefined, undefined);
    expect(isMarkEnabled(fieldInfo, MARKS.BOLD)).toBe(true);
  });
});

describe('isNodeTypeEnabled', () => {
  it('returns true if enabled', () => {
    const fieldInfo = fakeFieldInfo([BLOCKS.EMBEDDED_ENTRY], undefined);
    expect(isNodeTypeEnabled(fieldInfo, BLOCKS.EMBEDDED_ENTRY)).toBe(true);
  });

  it('returns false if not enabled', () => {
    const fieldInfo = fakeFieldInfo([], undefined);
    expect(isNodeTypeEnabled(fieldInfo, BLOCKS.EMBEDDED_ENTRY)).toBe(false);
  });

  it('returns true if no validations', () => {
    const fieldInfo = fakeFieldInfo(undefined, undefined);
    expect(isNodeTypeEnabled(fieldInfo, BLOCKS.EMBEDDED_ENTRY)).toBe(true);
  });
});
