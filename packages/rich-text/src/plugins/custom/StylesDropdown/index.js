import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dropdown,
  DropdownList,
  Button,
  DropdownListItem
} from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { css } from 'emotion';

// Basic styling for the dropdown component.
const styles = {
  root: css({
    width: '120px',

    [`@media (min-width: ${tokens.contentWidthDefault})`]: {
      width: '165px'
    },

    svg: {
      marginLeft: 'auto'
    },

    '> span': {
      padding: '0 2px!important'
    }
  })
};

// Map of style names to classes.
export const classMap = {
  Default: null,
  Coral: "text-c_coral",
  'Light Blue': "text-c_light_blue",
  'Michael Gray': "text-c_michael_gray",
}

// Styles dropdown allowing user to select a specific "style" that will be
// added to a block (or blocks).
export const StylesDropdown = ({ onClose, editor }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get active style class: if all selected blocks share the same style, then that's our "active" style.
  const first = editor.value.blocks.first();
  let activeClass = first ? first.data.get('class') : null;
  editor.value.blocks.forEach(el => {
    activeClass = el.data.get('class') === activeClass ? activeClass : false;
  });

  // Get the active style name using the class and class map.
  const activeStyleName = activeClass
    ? Object.keys(classMap).find(style => classMap[style] === activeClass)
    : null;

  // Handle a selection: When a new style is selected from the drop down, set all currently selected
  // blocks to that style.
  const handleSelect = e => {
    e.preventDefault();

    // New color name is the click target's inner text.
    const newStyle = e.target.innerText;

    // Set the new color data for all selected blocks.
    editor.value.blocks.forEach(block => {
      // Grab the data attributes for each block.
      const data = { ...block.data.toJSON() };

      // Unset current style class (so there's no difference between default and new content).
      delete data.class;

      // If the new color isn't the default, add it as a color attribute and set it in the editor.
      if (newStyle !== 'Default') data.class = classMap[newStyle];

      editor.setNodeByKey(block.key, { data });
    });

    // Close the dropdown.
    setIsOpen(false);
  };

  // Close the dropdown when the user clicks outside of it.
  const dropDownEl = useRef(null);

  const handleClick = useCallback(e => {
    if (dropDownEl.current && !dropDownEl.current.contains(e.target) && isOpen) {
      setIsOpen(false);
    }
  }, [dropDownEl, isOpen]);

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [handleClick]);

  return (
      <div ref={dropDownEl}>
        <Dropdown
            ref={dropDownEl}
            toggleElement={
              <Button
                  onClick={() => setIsOpen(!isOpen)}
                  className={styles.root}
                  indicateDropdown
                  buttonType="naked"
                  size="small"
                  disabled={false}>
          <span className={activeClass}>
            {activeStyleName ? activeStyleName : 'Styles'}
          </span>
              </Button>
            }
            isOpen={isOpen}
            onClose={onClose}>
          <DropdownList>
            {Object.keys(classMap).map((style, i) => (
                <DropdownListItem
                    key={i}
                    label={style}
                    className={classMap[style]}
                    onClick={handleSelect}>
                  {style}
                </DropdownListItem>
            ))}
          </DropdownList>
        </Dropdown>
      </div>
  );
};
