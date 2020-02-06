import isHotkey from 'is-hotkey';
import markDecorator from './MarkDecorator';
import { haveMarks } from './UtilHave';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const styles = {
  bold: css({
    color: 'inherit',
    'font-weight': tokens.fontWeightDemiBold
  }),
  headingBold: css({
    'font-weight': 900
  })
};

const isHeading = tagName => /^h[1-6]$/.test(tagName);

const getClassName = (type, tagName) =>
  type === 'bold' ? cx(styles.bold, isHeading(tagName) && styles.headingBold) : '';

export default function({ type, tagName, hotkey, richTextAPI }) {
  return {
    renderMark: (props, _editor, next) => {
      if (props.mark.type === type) {
        return markDecorator(tagName, { className: getClassName(type, tagName) })(props);
      }
      return next();
    },
    onKeyDown(event, editor, next) {
      if (isHotkey(hotkey, event)) {
        editor.toggleMark(type);

        const action = haveMarks(editor, type) ? 'mark' : 'unmark';
        richTextAPI.logShortcutAction(action, { markType: type });
        return;
      }
      return next();
    }
  };
}
