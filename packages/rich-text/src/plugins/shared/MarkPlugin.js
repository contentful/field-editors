import isHotkey from 'is-hotkey';
import markDecorator from './MarkDecorator';
import { haveMarks } from './UtilHave';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const styles = {
  bold: css({
    color: 'inherit',
    fontWeight: tokens.fontWeightDemiBold,
  }),
  headingBold: css({
    fontWeight: 900, // Make headings which are already bold even bolder.
  }),
  italic: css({
    fontStyle: 'italic',
  }),
  code: css({
    fontFamily: tokens.fontStackMonospace,
    fontSize: '.9em', // Can't use `rem` to account for code inside a heading.
  }),
};

const isHeading = (tagName) => /^h[1-6]$/.test(tagName);

const getMarkStyles = (type, tagName) =>
  type === 'bold' ? cx(styles.bold, isHeading(tagName) && styles.headingBold) : styles[type];

export default function ({ type, tagName, hotkey, richTextAPI }) {
  return {
    renderMark: (props, _editor, next) => {
      if (props.mark.type === type) {
        return markDecorator(tagName, { className: getMarkStyles(type, tagName) })(props);
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
    },
  };
}
