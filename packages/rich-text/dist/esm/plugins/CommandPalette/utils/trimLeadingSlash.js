export function trimLeadingSlash(text) {
    if (!text.startsWith('/')) {
        return text;
    }
    return text.slice(1);
}
