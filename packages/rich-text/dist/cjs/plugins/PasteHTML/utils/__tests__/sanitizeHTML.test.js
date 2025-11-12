"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _sanitizeHTML = require("../sanitizeHTML");
describe('HTML Sanitization', ()=>{
    it('removes unsupported elements from <a>', ()=>{
        const cases = [
            {
                input: '<h1><a href="#">Link in h1</a></h1>',
                output: 'unchanged'
            },
            {
                input: '<div><a href="#">Link in div</a></div>',
                output: 'unchanged'
            },
            {
                input: '<a href="#"><strong>strong in Link</strong></a>',
                output: 'unchanged'
            },
            {
                input: '<a href="#"><b>b in Link</b></a>',
                output: 'unchanged'
            },
            {
                input: '<a href="#"><em>em in Link</em></a>',
                output: 'unchanged'
            },
            {
                input: '<a href="#"><i>i in Link</i></a>',
                output: 'unchanged'
            },
            {
                input: '<a href="#"><u>u in Link</u></a>',
                output: 'unchanged'
            },
            {
                input: '<a href="#"><h1>h1 in Link</h1><h2>this is h2</h2></a>',
                output: '<a href="#">h1 in Link  this is h2</a>'
            },
            {
                input: '<a href="#"><p>p in Link</p></a>',
                output: '<a href="#">p in Link</a>'
            },
            {
                input: '<a href="#"><h1>h1 in Link <i>with</i> <b>marks</b></h1></a>',
                output: '<a href="#">h1 in Link <i>with</i> <b>marks</b></a>'
            }
        ];
        cases.forEach((case_)=>{
            expect((0, _sanitizeHTML.sanitizeHTML)(case_.input)).toBe(case_.output === 'unchanged' ? case_.input : case_.output);
        });
    });
});
