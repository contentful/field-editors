/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-use-before-define */

import React from 'react';
import ReactDOM from 'react-dom';
import { Modal } from '@contentful/forma-36-react-components';
import { OpenMarkdownDialogParams } from '../types';

let rootDom: any = null;

const getRoot = () => {
  if (rootDom === null) {
    rootDom = document.createElement('div');
    rootDom.setAttribute('id', 'markdown-modal-root');
    document.body.appendChild(rootDom);
  }
  return rootDom;
};

export function open(componentRenderer: (params: { onClose: Function; isShown: boolean }) => any) {
  return new Promise(resolve => {
    let currentConfig = { onClose, isShown: true };

    function render({ onClose, isShown }: { onClose: Function; isShown: boolean }) {
      ReactDOM.render(componentRenderer({ onClose, isShown }), getRoot());
    }

    function onClose(...args: any[]) {
      currentConfig = {
        ...currentConfig,
        isShown: false
      };
      render(currentConfig);
      resolve(...args);
    }

    render(currentConfig);
  });
}

export function openDialog<T>(
  options: OpenMarkdownDialogParams,
  Component: React.SFC<{ onClose: (result: T) => void }>
) {
  const key = Date.now();
  return open(({ isShown, onClose }) => {
    return (
      <Modal
        key={key}
        shouldCloseOnOverlayClick={options.shouldCloseOnOverlayClick || false}
        shouldCloseOnEscapePress={options.shouldCloseOnEscapePress || false}
        position={options.position || 'center'}
        isShown={isShown}
        onClose={() => onClose()}
        size={`${options.width || 700}px`}>
        {() => (
          <>
            {options.title && (
              <Modal.Header
                testId="markdown-dialog-title"
                title={options.title}
                onClose={() => onClose()}
              />
            )}
            <Component onClose={onClose as any} />
          </>
        )}
      </Modal>
    );
  });
}

export default {
  openDialog
};
