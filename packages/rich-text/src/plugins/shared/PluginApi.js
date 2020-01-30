import PropTypes from 'prop-types';

/**
 * All known origins for Rich Text actions
 * @type {object}
 */
export const actionOrigin = {
  TOOLBAR: 'toolbar-icon',
  SHORTCUT: 'shortcut',
  VIEWPORT: 'viewport-interaction',
  COMMAND_PALETTE: 'command-palette'
};

const createActionLogger = (onAction, origin) => (name, data) => {
  onAction(name, { origin, ...data });
};

/**
 * Creates an api that is passed to editor and toolbar widgets.
 *
 * @param {object} widgetAPI
 * @param {function } onAction
 * @returns {{ widgetAPI: {object}, logViewportAction: {function}, createActionLogger: {function}, createActionLogger: {function} }}
 */
export const createRichTextAPI = ({ widgetAPI, onAction }) => {
  return {
    widgetAPI,
    logViewportAction: createActionLogger(onAction, actionOrigin.VIEWPORT),
    logShortcutAction: createActionLogger(onAction, actionOrigin.SHORTCUT),
    logToolbarAction: createActionLogger(onAction, actionOrigin.TOOLBAR),
    logCommandPaletteAction: createActionLogger(onAction, actionOrigin.COMMAND_PALETTE)
  };
};

/**
 * Describes the prop types a Rich Text editor plugin can expect.
 * @type {object}
 */
export const EDITOR_PLUGIN_PROP_TYPES = {
  richTextAPI: PropTypes.shape({
    widgetAPI: PropTypes.object.isRequired,
    logViewportAction: PropTypes.func.isRequired,
    logShortcutAction: PropTypes.func.isRequired,
    logToolbarAction: PropTypes.func.isRequired
  })
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
  isButton: PropTypes.bool
};
