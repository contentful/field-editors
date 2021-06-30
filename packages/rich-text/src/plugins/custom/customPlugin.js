import { BLOCKS } from '@contentful/rich-text-types';
import CommonNode from '../shared/NodeDecorator';

const blockToTagMap = {
  [BLOCKS.PARAGRAPH]: 'p',
  [BLOCKS.HEADING_1]: 'h1',
  [BLOCKS.HEADING_2]: 'h2',
  [BLOCKS.HEADING_3]: 'h3',
  [BLOCKS.HEADING_4]: 'h4',
  [BLOCKS.HEADING_5]: 'h5',
  [BLOCKS.HEADING_6]: 'h6'
};

// Apply changes from our custom plugins to the RTE UI itself.
export const CustomPlugin = () => ({
  renderNode: (props, editor, next) => {
    if (props.node.type in blockToTagMap) {
      const styles = { style: {} };
      const textAlign = props.node.data.get('textAlign');
      const smallText = props.node.data.get('smallText');
      const styleClass = props.node.data.get('class');

      if (textAlign) styles.style.textAlign = textAlign;
      if (smallText) {
        styles.style.fontSize = '0.75rem';
        styles.style.lineHeight = '1rem';
      }

      return CommonNode(blockToTagMap[props.node.type], styles, [styleClass])(props);
    }
    return next();
  }
});
