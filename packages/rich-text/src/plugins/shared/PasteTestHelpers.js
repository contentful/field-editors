import { BLOCKS } from '@contentful/rich-text-types';

export const document = (props, ...nodes) => {
  const defaultProps = { data: {} };
  return {
    object: 'document',
    ...defaultProps,
    ...props,
    nodes
  };
};

export const block = (type, props, ...nodes) => {
  const defaultProps = { data: {} };
  return {
    type,
    object: 'block',
    ...defaultProps,
    ...props,
    nodes
  };
};

export const inline = (type, props, ...nodes) => {
  const defaultProps = {};
  return {
    type,
    object: 'inline',
    ...defaultProps,
    ...props,
    nodes
  };
};

export const text = (props, ...leaves) => {
  return {
    object: 'text',
    ...props,
    leaves
  };
};

export const leaf = (text = '', ...marks) => {
  return {
    object: 'leaf',
    text,
    marks
  };
};

export const mark = type => {
  return {
    type,
    object: 'mark',
    data: {}
  };
};

export const emptyText = () => text({}, leaf());

export const emptyParagraph = () => {
  return {
    type: BLOCKS.PARAGRAPH,
    object: 'block',
    data: {},
    nodes: [emptyText()]
  };
};

class FakeDataTransfer {
  constructor() {
    this.items = [];
    this.types = [];
  }

  getData(key) {
    return this.items.find(item => item.key === key).value;
  }

  setData(key, value) {
    this.types.push(key);
    this.items.push({ key, value });
  }
}

export const createPasteEvent = (type, value) => {
  const fakeDataTransfer = new FakeDataTransfer();
  fakeDataTransfer.setData(type, value);
  const pasteEvent = { dataTransfer: fakeDataTransfer };
  return pasteEvent;
};

export const createPasteHtmlEvent = html => createPasteEvent('text/html', html);
