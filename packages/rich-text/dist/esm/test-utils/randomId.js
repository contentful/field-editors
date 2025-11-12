export const randomId = (prefix = '')=>{
    return `${prefix}-${(Math.random() + 1).toString(36).substring(10)}`;
};
