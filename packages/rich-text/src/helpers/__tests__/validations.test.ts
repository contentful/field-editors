import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import { MARKS } from '@contentful/rich-text-types';

import { isMarkEnabled } from '../validations';

describe('validations', () => {
  describe('isMarkEnabled', () => {
    [MARKS.BOLD, MARKS.CODE, MARKS.ITALIC, MARKS.UNDERLINE].forEach((mark) => {
      it(`returns true for ${mark} mark when no validation explicity set`, () => {
        const [field] = createFakeFieldAPI();
        const actual = isMarkEnabled(field, mark);
        expect(actual).toBe(true);
      });
      it(`returns false for ${mark} mark when validation explicity set without it`, () => {
        const [field] = createFakeFieldAPI((field) => {
          field.validations = [
            {
              enabledMarks: Object.values(MARKS).filter((markDefintion) => markDefintion !== mark),
            },
          ];
          return field;
        });

        const actual = isMarkEnabled(field, mark);
        expect(actual).toBe(false);
      });
      it(`returns true for ${mark} mark when validation explicity set with it`, () => {
        const [field] = createFakeFieldAPI((field) => {
          field.validations = [{ enabledMarks: [mark] }];
          return field;
        });
        const actual = isMarkEnabled(field, mark);
        expect(actual).toBe(true);
      });
    });
    it('returns false for superscript mark if no validation explicitly set', () => {
      const [field] = createFakeFieldAPI();
      const actual = isMarkEnabled(field, MARKS.SUPERSCRIPT);
      expect(actual).toBe(false);
    });
    it('returns true for superscript mark if validation explicitly set', () => {
      const [field] = createFakeFieldAPI((field) => {
        field.validations = [{ enabledMarks: [MARKS.SUPERSCRIPT] }];
        return field;
      });
      const actual = isMarkEnabled(field, MARKS.SUPERSCRIPT);
      expect(actual).toBe(true);
    });
    it('returns false for subscript mark if no validation explicitly set', () => {
      const [field] = createFakeFieldAPI();
      const actual = isMarkEnabled(field, MARKS.SUBSCRIPT);
      expect(actual).toBe(false);
    });
    it('returns true for subscript mark if validation explicitly set', () => {
      const [field] = createFakeFieldAPI((field) => {
        field.validations = [{ enabledMarks: [MARKS.SUBSCRIPT] }];
        return field;
      });
      const actual = isMarkEnabled(field, MARKS.SUBSCRIPT);
      expect(actual).toBe(true);
    });
  });
});
