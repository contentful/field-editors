/**
 * Handles setting the focus in the Slate editor (if possible due to Slate restrictions)
 * when clicking on a toolbar acton while the editor got no focus.
 *
 * Ideally we would always focus the editor in his case, but this might result
 * in a Slate crash if the editor hasn't been manually focused by the user at
 * that point.
 */
export const toolbarActionHandlerWithSafeAutoFocus = (component, customHandler) => (event) => {
  event.preventDefault();

  const { editor, canAutoFocus } = component.props;

  if (!editor.value.selection.isFocused) {
    if (canAutoFocus) {
      editor.focus();
    } else {
      // Note: This is only necessary as Slate in 0.4x in our case crashes when
      //  working on the document before the user manually focuses. Attempts at
      //  programmatically setting focus and a proper value.selection were in vain.
      // TODO: Upgrade Slate or figure out how to editor.setFocus when clicking
      //  a toolbar icon without the editor crashing when starting to type.
      return;
    }
  }
  return customHandler(event);
};
