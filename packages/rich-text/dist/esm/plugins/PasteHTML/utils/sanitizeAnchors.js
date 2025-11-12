const wrapSpaceAround = (el)=>{
    const spacer = new Text(' ');
    const parent = el.parentNode;
    if (!parent) {
        return;
    }
    if (el.previousSibling) {
        parent.insertBefore(spacer, el);
    }
    if (el.nextSibling) {
        parent.insertBefore(spacer, el.nextSibling);
    }
};
const unwrap = (el)=>{
    wrapSpaceAround(el);
    el.replaceWith(...Array.from(el.childNodes));
};
export const sanitizeAnchors = (doc)=>{
    const unsupportedTagSelector = `a :not(${[
        'b',
        'strong',
        'code',
        'pre',
        'em',
        'i',
        'sub',
        'sup',
        'u',
        'span'
    ].join(',')})`;
    doc.querySelectorAll(unsupportedTagSelector).forEach(unwrap);
    return doc;
};
