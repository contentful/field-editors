import {
  KEY_DESERIALIZE_HTML,
  cleanHtmlBrElements,
  cleanHtmlFontElements,
  cleanHtmlLinkElements,
  cleanHtmlTextNodes,
  copyBlockMarksToSpanChild,
  postCleanHtml,
  preCleanHtml,
} from '@udecode/plate-common';
import {
  cleanDocxBrComments,
  cleanDocxEmptyParagraphs,
  cleanDocxFootnotes,
  cleanDocxImageElements,
  cleanDocxListElements,
  cleanDocxQuotes,
  cleanDocxSpans,
  createDeserializeDocxPlugin as originalCreateDeserializeDocxPlugin,
  isDocxContent,
} from '@udecode/plate-serializer-docx';

import { PlatePlugin } from '../../internal';
import { cleanHtmlEmptyElements } from './cleanHtmlEmptyElements';

export const createDeserializeDocxPlugin: () => PlatePlugin = () =>
  originalCreateDeserializeDocxPlugin({
    inject: {
      pluginsByKey: {
        [KEY_DESERIALIZE_HTML]: {
          editor: {
            insertData: {
              transformData: (data, { dataTransfer }) => {
                const rtf = dataTransfer.getData('text/rtf');
                const document = new DOMParser().parseFromString(preCleanHtml(data), 'text/html');
                const { body } = document;
                if (!rtf && !isDocxContent(body)) {
                  return data;
                }
                cleanDocxFootnotes(body);
                cleanDocxImageElements(document, rtf, body);
                cleanHtmlEmptyElements(body);
                cleanDocxEmptyParagraphs(body);
                cleanDocxQuotes(body);
                cleanDocxSpans(body);
                cleanHtmlTextNodes(body);
                cleanDocxBrComments(body);
                cleanHtmlBrElements(body);
                cleanHtmlLinkElements(body);
                cleanHtmlFontElements(body);
                cleanDocxListElements(body);
                copyBlockMarksToSpanChild(body);
                return postCleanHtml(body.innerHTML);
              },
            },
          },
        },
      },
    },
  });
