import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import { MARKS } from '@contentful/rich-text-types';
import { isMarkEnabled } from '../validations';
describe('validations', ()=>{
    describe('isMarkEnabled', ()=>{
        [
            MARKS.BOLD,
            MARKS.CODE,
            MARKS.ITALIC,
            MARKS.UNDERLINE
        ].forEach((mark)=>{
            it(`returns true for ${mark} mark when no validation explicity set`, ()=>{
                const [field] = createFakeFieldAPI();
                const actual = isMarkEnabled(field, mark);
                expect(actual).toBe(true);
            });
            it(`returns false for ${mark} mark when validation explicity set without it`, ()=>{
                const [field] = createFakeFieldAPI((field)=>{
                    field.validations = [
                        {
                            enabledMarks: Object.values(MARKS).filter((markDefintion)=>markDefintion !== mark)
                        }
                    ];
                    return field;
                });
                const actual = isMarkEnabled(field, mark);
                expect(actual).toBe(false);
            });
            it(`returns true for ${mark} mark when validation explicity set with it`, ()=>{
                const [field] = createFakeFieldAPI((field)=>{
                    field.validations = [
                        {
                            enabledMarks: [
                                mark
                            ]
                        }
                    ];
                    return field;
                });
                const actual = isMarkEnabled(field, mark);
                expect(actual).toBe(true);
            });
        });
    });
});
