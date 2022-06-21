import * as React from 'react';

import { Card, Text } from '@contentful/f36-components';
import { css } from 'emotion';

import { getCaretTopPoint } from './helpers';

type TopLeftPosition = { top: number; left: number };

interface SlashCommandsPaletteProps {
  editorId: string;
}

const style = {
  container: ({ top, left }: TopLeftPosition) =>
    css({
      position: 'fixed',
      top: top - 14, // 14px comes from the `Card` component padding value
      left: left + 10, // 10px just to have a better reading
      zIndex: 1,
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)',
      borderRadius: '8px',
      userSelect: 'none',
    }),
};

export function SlashCommandsPalette({ editorId }: SlashCommandsPaletteProps) {
  const [position, setPosition] = React.useState<TopLeftPosition | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  // The user is not annoyed every time they type `/`
  const MAX_TRIES = 3;
  const [currentTries, setCurrentTries] = React.useState(0);

  React.useEffect(() => {
    function handler(event) {
      if (editorId !== event.detail.editorId) return;

      const topLeft = getCaretTopPoint();
      if (!topLeft) return;

      setPosition(topLeft);
      setIsOpen(true);
      setCurrentTries((curr) => curr + 1);
    }

    document.addEventListener('open-rte-palette-commands', handler);

    return () => {
      document.removeEventListener('open-rte-palette-commands', handler);
    };
  }, [editorId]);

  React.useEffect(() => {
    function handler(event) {
      if (editorId !== event.detail.editorId) return;

      closePanel();
    }

    document.addEventListener('close-rte-palette-commands', handler);

    return () => document.removeEventListener('close-rte-palette-commands', handler);
  }, [editorId]);

  React.useEffect(() => {
    if (!isOpen) return;

    function handler() {
      closePanel();
    }

    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);

    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [isOpen]);

  function closePanel() {
    setIsOpen(false);
    setPosition(null);
  }

  if (!isOpen || !position || currentTries > MAX_TRIES) return null;

  return (
    <div className={style.container(position)} data-test-id="rte-slash-commands">
      <Card>
        <Text>Slash commands are temporarily unavailable.</Text>
      </Card>
    </div>
  );
}
