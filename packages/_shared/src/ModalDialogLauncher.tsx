/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-use-before-define */

import * as React from 'react';
import { flushSync } from 'react-dom';
import { createRoot, Root } from 'react-dom/client';

import { OpenCustomWidgetOptions } from '@contentful/app-sdk';
import { Modal, ModalHeader } from '@contentful/f36-components';
import isNumber from 'lodash/isNumber';

const CLOSE_DELAY = 300;

export function open(componentRenderer: (params: { onClose: Function; isShown: boolean }) => any) {
  let rootDom: HTMLDivElement | null = null;
  let reactRoot: Root | null = null;

  const getRoot = () => {
    if (rootDom === null) {
      rootDom = document.createElement('div');
      rootDom.setAttribute('id', 'field-editor-modal-root');
      document.body.appendChild(rootDom);
      reactRoot = createRoot(rootDom);
    }
    return reactRoot!;
  };

  return new Promise((resolve) => {
    let currentConfig = { onClose, isShown: true };

    function render({ onClose, isShown }: { onClose: Function; isShown: boolean }) {
      flushSync(() => {
        getRoot().render(componentRenderer({ onClose, isShown }));
      });
    }

    async function onClose(...args: any[]) {
      currentConfig = {
        ...currentConfig,
        isShown: false,
      };
      render(currentConfig);
      // @ts-expect-error -- resolve is called with variadic args from onClose
      resolve(...args);
      await new Promise((r) => setTimeout(r, CLOSE_DELAY));
      reactRoot?.unmount();
      rootDom?.remove();
    }

    render(currentConfig);
  });
}

export function openDialog<T>(
  options: OpenCustomWidgetOptions,
  Component: React.FC<{ onClose: (result: T) => void }>,
) {
  const key = Date.now();
  const size = isNumber(options.width) ? `${options.width}px` : options.width;
  return open(({ isShown, onClose }) => {
    const onCloseHandler = () => onClose();
    return (
      <Modal
        key={key}
        shouldCloseOnOverlayClick={options.shouldCloseOnOverlayClick || false}
        shouldCloseOnEscapePress={options.shouldCloseOnEscapePress || false}
        allowHeightOverflow={options.allowHeightOverflow || false}
        position={options.position || 'center'}
        isShown={isShown}
        onClose={onCloseHandler}
        size={size || '700px'}
      >
        {() => (
          <>
            {options.title && (
              <ModalHeader testId="dialog-title" title={options.title} onClose={onCloseHandler} />
            )}
            <div style={{ minHeight: options.minHeight || 'auto' }}>
              <Component onClose={onClose as any} />
            </div>
          </>
        )}
      </Modal>
    );
  });
}

export default {
  openDialog,
};
