"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "sanitizeHTML", {
    enumerable: true,
    get: function() {
        return sanitizeHTML;
    }
});
const _sanitizeAnchors = require("./sanitizeAnchors");
const _sanitizeSheets = require("./sanitizeSheets");
const stripStyleTags = (doc)=>{
    doc.querySelectorAll('style').forEach((e)=>{
        e.remove();
    });
    return doc;
};
const stripMetaTags = (doc)=>{
    doc.querySelectorAll('meta').forEach((el)=>el.remove());
    return doc;
};
const transformers = [
    stripStyleTags,
    _sanitizeSheets.sanitizeSheets,
    stripMetaTags,
    _sanitizeAnchors.sanitizeAnchors
];
function removeTableWrappers(table) {
    const parent = table.parentElement;
    if (parent && parent.tagName === 'DIV' && parent.children.length === 1) {
        parent.replaceWith(table);
        removeTableWrappers(table);
    }
}
const sanitizeHTML = (html)=>{
    const doc = transformers.reduce((value, cb)=>cb(value), new DOMParser().parseFromString(html, 'text/html'));
    const replacers = [
        (innerHtml)=>innerHtml.replace(/<(\/)?(table|thead|tbody|tr|td|th|caption|col|colgroup|ol|ul|li)(.*)>\s+<(\/)?(table|thead|tbody|tr|td|th|caption|col|colgroup|ol|ul|li)/g, '<$1$2$3><$4$5'),
        (innerHtml)=>innerHtml.replace(/(?:<[^>^/]*>)\s*(?:<\/[^>]*>)<\/(div|p|table|thead|tbody|tr|td|th|caption|col|colgroup|ol|ul|li)/g, '</$1'),
        (innerHTML)=>innerHTML.replace(/\s*<\/(div|p|table|thead|tbody|tr|td|th|caption|col|colgroup|ol|ul|li)/g, '</$1')
    ];
    let previous;
    do {
        previous = doc.body.innerHTML;
        doc.body.innerHTML = replacers.reduce((innerHTML, replacer)=>replacer(innerHTML), doc.body.innerHTML);
    }while (doc.body.innerHTML !== previous)
    doc.querySelectorAll('table').forEach(removeTableWrappers);
    return doc.body.innerHTML;
};
