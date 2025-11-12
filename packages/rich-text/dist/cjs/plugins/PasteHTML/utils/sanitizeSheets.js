"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "sanitizeSheets", {
    enumerable: true,
    get: function() {
        return sanitizeSheets;
    }
});
const sanitizeSheets = (doc)=>{
    const supported = [
        'google-sheets-html-origin',
        'meta[content="Excel.Sheet"]',
        'meta[content*="Microsoft Excel"]'
    ];
    if (!supported.some((selector)=>!!doc.querySelector(selector))) {
        return doc;
    }
    const isEmptyElement = (el)=>{
        return (el.textContent ?? '').trim() === '';
    };
    const tables = Array.from(doc.querySelectorAll('table'));
    for (const table of tables){
        table.querySelectorAll('tr').forEach((row)=>{
            isEmptyElement(row) && row.remove();
        });
        const rows = Array.from(table.querySelectorAll('tr'));
        let colIndex = 1;
        while(true){
            const cells = rows.map((row)=>row.querySelector(`th:nth-of-type(${colIndex}), td:nth-of-type(${colIndex})`)).filter((cell)=>!!cell);
            if (cells.length === 0) {
                break;
            }
            const isEmpty = cells.every((cell)=>isEmptyElement(cell));
            if (!isEmpty) {
                colIndex += 1;
                continue;
            }
            cells.forEach((cell)=>cell.remove());
        }
    }
    return doc;
};
