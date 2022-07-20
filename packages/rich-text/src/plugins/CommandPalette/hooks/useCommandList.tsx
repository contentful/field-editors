import * as React from 'react';

import isHotkey from 'is-hotkey';

export const useCommandList = (commandItems, container) => {
  const [selectedItem, setSelectedItem] = React.useState<string>(() => {
    // select the first item on initial render
    if (!commandItems.length) {
      return '';
    }
    if ('group' in commandItems[0]) {
      return commandItems[0].commands[0].id;
    }
    return commandItems[0].id;
  });
  const [isOpen, setIsOpen] = React.useState(commandItems.length > 0);

  React.useEffect(() => {
    if (!container.current) {
      return;
    }
    const buttons = Array.from(container.current.querySelectorAll('button')) as HTMLButtonElement[];
    const currBtn = buttons.find((btn) => btn.id === selectedItem);
    const currIndex = currBtn ? buttons.indexOf(currBtn) : 0;
    const shouldSelectFirstBtn = !currBtn && buttons.length;

    if (shouldSelectFirstBtn) {
      setSelectedItem(buttons[0].id);
      buttons[0].scrollIntoView({
        block: 'nearest',
        inline: 'start',
      });
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (isHotkey('up', event)) {
        event.preventDefault();
        if (currIndex === 0) {
          return;
        }
        setSelectedItem(buttons[currIndex - 1].id);
        buttons[currIndex - 1].scrollIntoView({
          block: 'nearest',
          inline: 'start',
        });
      } else if (isHotkey('down', event)) {
        event.preventDefault();
        if (currIndex === buttons.length - 1) {
          return;
        }
        setSelectedItem(buttons[currIndex + 1].id);
        buttons[currIndex + 1].scrollIntoView({
          block: 'nearest',
          inline: 'start',
        });
      } else if (isHotkey('enter', event)) {
        event.preventDefault();
        if (currBtn) {
          setSelectedItem('');
          currBtn.click();
        }
      }
      //TODO: handle shift+enter, which must be detected using separate events
    }

    if (commandItems.length) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandItems, container, selectedItem]);

  React.useEffect(() => {
    const handleMousedown = (event) => {
      if (container.current && !container.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMousedown);
    return () => {
      document.removeEventListener('mousedown', handleMousedown);
    };
  }, [container]);

  return {
    selectedItem,
    isOpen,
  };
};
