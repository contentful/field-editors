/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-use-before-define */

import * as React from 'react';
import ReactDOM from 'react-dom';

import { OpenCustomWidgetOptions } from '@contentful/app-sdk';
import { Modal, ModalHeader } from '@contentful/f36-components';
import isNumber from 'lodash/isNumber';

export function open(componentRenderer: (params: { onClose: Function; isShown: boolean }) => any) {
  let rootDom: any = null;

  const getRoot = () => {
    if (rootDom === null) {
      rootDom = document.createElement('div');
      rootDom.setAttribute('id', 'field-editor-modal-root');
      document.body.appendChild(rootDom);
    }
    return rootDom;
  };

  return new Promise((resolve) => {
    let currentConfig = { onClose, isShown: true };

    function render({ onClose, isShown }: { onClose: Function; isShown: boolean }) {
      ReactDOM.render(componentRenderer({ onClose, isShown }), getRoot());
    }

    function onClose(...args: any[]) {
      currentConfig = {
        ...currentConfig,
        isShown: false,
      };
      render(currentConfig);
      // eslint-disable-next-line -- TODO: describe this disable  @typescript-eslint/ban-ts-comment
      // @ts-ignore
      resolve(...args);
      getRoot().remove();
    }

    render(currentConfig);
  });
}

export function openDialog<T>(
  options: OpenCustomWidgetOptions,
  Component: React.SFC<{ onClose: (result: T) => void }>
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
