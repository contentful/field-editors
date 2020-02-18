const RICH_TEXT_COMMANDS_CONTEXT_MARK_TYPE = 'richTextCommandsContext';

/**
 * @description
 * Returns Command Palette command text or leading slash
 *
 * @param {Slate.Editor} editor
 * @returns {String}
 */
export const getCommandText = editor => {
  // matches the character / literally (case sensitive)
  if (!editor.value.startText) {
    return null;
  }
  const COMMAND_REGEX = /\/(\S*)$/;
  const startOffset = editor.value.selection.start.offset;
  const textBefore = editor.value.startText.text.slice(0, startOffset);
  const result = COMMAND_REGEX.exec(textBefore);
  return result === null ? null : result[1] || result[0];
};

/**
 * @description
 * Returns Command Palette Decoration if applicable to current text.
 *
 * @param {Slate.Editor} editor
 * @returns {Slate.Decoration?}
 */
export const getDecorationOrDefault = editor => {
  const value = editor.value;
  if (!value.startText) {
    return null;
  }

  const inputValue = getCommandText(editor);

  const { selection } = value;

  if (inputValue) {
    const decoration = {
      anchor: {
        key: selection.start.key,
        offset: selection.start.offset - (inputValue.length + 1)
      },
      focus: {
        key: selection.start.key,
        offset: selection.start.offset
      },
      mark: {
        type: RICH_TEXT_COMMANDS_CONTEXT_MARK_TYPE
      }
    };
    return decoration;
  }
  return null;
};

export const hasCommandPaletteMarkType = markType => {
  return markType === RICH_TEXT_COMMANDS_CONTEXT_MARK_TYPE;
};

/**
 * @description
 * Checks if document has command palette decoration
 *
 * @param {Slate.Editor} editor
 * @returns {Boolean}
 */
export const hasCommandPaletteDecoration = editor => {
  const decorations = editor.value.document.getDecorations(editor);

  if (decorations.isEmpty()) {
    return false;
  }

  const commandPaletteDecoration = decorations.find(
    d => d.mark.type === RICH_TEXT_COMMANDS_CONTEXT_MARK_TYPE
  );
  return Boolean(commandPaletteDecoration);
};

export const removeCommand = (editor, command, anchorOffset = 1) => {
  editor.removeTextByKey(
    editor.value.selection.start.key,
    editor.value.selection.start.offset - (command.length + anchorOffset),
    command.length + anchorOffset
  );
};
