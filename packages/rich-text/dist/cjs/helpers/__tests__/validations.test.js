"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _fieldeditortestutils = require("@contentful/field-editor-test-utils");
const _richtexttypes = require("@contentful/rich-text-types");
const _validations = require("../validations");
describe('validations', ()=>{
    describe('isMarkEnabled', ()=>{
        [
            _richtexttypes.MARKS.BOLD,
            _richtexttypes.MARKS.CODE,
            _richtexttypes.MARKS.ITALIC,
            _richtexttypes.MARKS.UNDERLINE
        ].forEach((mark)=>{
            it(`returns true for ${mark} mark when no validation explicity set`, ()=>{
                const [field] = (0, _fieldeditortestutils.createFakeFieldAPI)();
                const actual = (0, _validations.isMarkEnabled)(field, mark);
                expect(actual).toBe(true);
            });
            it(`returns false for ${mark} mark when validation explicity set without it`, ()=>{
                const [field] = (0, _fieldeditortestutils.createFakeFieldAPI)((field)=>{
                    field.validations = [
                        {
                            enabledMarks: Object.values(_richtexttypes.MARKS).filter((markDefintion)=>markDefintion !== mark)
                        }
                    ];
                    return field;
                });
                const actual = (0, _validations.isMarkEnabled)(field, mark);
                expect(actual).toBe(false);
            });
            it(`returns true for ${mark} mark when validation explicity set with it`, ()=>{
                const [field] = (0, _fieldeditortestutils.createFakeFieldAPI)((field)=>{
                    field.validations = [
                        {
                            enabledMarks: [
                                mark
                            ]
                        }
                    ];
                    return field;
                });
                const actual = (0, _validations.isMarkEnabled)(field, mark);
                expect(actual).toBe(true);
            });
        });
    });
});
