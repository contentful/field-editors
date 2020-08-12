import PropTypes from 'prop-types';

/**
 * All known origins for Rich Text actions
 * @type {object}
 */
export const actionOrigin = {
  TOOLBAR: 'toolbar-icon',
  SHORTCUT: 'shortcut',
  VIEWPORT: 'viewport-interaction',
  COMMAND_PALETTE: 'command-palette',
};

const createActionLogger = (onAction, origin) => (name, data) => {
  onAction(name, { origin, ...data });
};

/**
 * Creates an api that is passed to editor and toolbar widgets.
 *
 * @param {object} sdk
 * @param {function } onAction
 * @returns {{ sdk: {object}, logViewportAction: {function}, createActionLogger: {function}, createActionLogger: {function} }}
 */
export const createRichTextAPI = ({ sdk, onAction }) => {
  const richTextAPI = {
    sdk,
    logViewportAction: createActionLogger(onAction, actionOrigin.VIEWPORT),
    logShortcutAction: createActionLogger(onAction, actionOrigin.SHORTCUT),
    logToolbarAction: createActionLogger(onAction, actionOrigin.TOOLBAR),
    logCommandPaletteAction: createActionLogger(onAction, actionOrigin.COMMAND_PALETTE),
  };
  return richTextAPI;
};

/**
 * Describes the prop types a Rich Text editor plugin can expect.
 * @type {object}
 */
export const EDITOR_PLUGIN_PROP_TYPES = {
  richTextAPI: PropTypes.shape({
    sdk: PropTypes.object.isRequired,
    logViewportAction: PropTypes.func.isRequired,
    logShortcutAction: PropTypes.func.isRequired,
    logToolbarAction: PropTypes.func.isRequired,
  }),
};

/**
 * Describes the prop types a Rich Text toolbar plugin can expect.
 * @type {object}
 */
export const TOOLBAR_PLUGIN_PROP_TYPES = {
  ...EDITOR_PLUGIN_PROP_TYPES,
  editor: PropTypes.object.isRequired,
  onToggle: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  isButton: PropTypes.bool,
  // TODO: Should get rid of this as it's just necessary as a hack to prevent
  //  crashes before the user manually set the focus to the Slate input.
  canAutoFocus: PropTypes.bool,
};
