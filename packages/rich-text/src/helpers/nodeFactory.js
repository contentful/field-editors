export const document = (...content) => ({
  nodeType: 'document',
  content,
  data: {}
});

export const block = (nodeType, data, ...content) => ({
  nodeType,
  content,
  data
});

export const inline = (nodeType, data, ...content) => ({
  nodeType,
  content,
  data
});

export const text = (value = '', marks = []) => ({
  nodeType: 'text',
  value,
  marks,
  data: {}
});

export const mark = type => ({
  type
});
