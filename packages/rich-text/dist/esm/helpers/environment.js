export const IS_SAFARI = typeof navigator !== 'undefined' && /Version\/[\d.]+.*Safari/.test(navigator.userAgent);
export const IS_CHROME = /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9.]+)(:?\s|$)/.test(navigator.userAgent);
