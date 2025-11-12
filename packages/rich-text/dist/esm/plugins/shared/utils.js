const isResourceLink = (link)=>!!link.sys.urn;
export const getLinkEntityId = (link)=>isResourceLink(link) ? link.sys.urn : link.sys.id;
export function truncateTitle(str, length) {
    if (typeof str === 'string' && str.length > length) {
        return str && str.substr(0, length + 1).replace(/(\s+\S(?=\S)|\s*)\.?.$/, '…');
    }
    return str;
}
