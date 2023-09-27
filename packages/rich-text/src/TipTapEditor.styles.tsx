/* Basic editor styles */
import { css } from 'emotion';

export const styles = {
  tiptap: ({ minHeight }: { minHeight?: string | number }) => css`
    padding: 12px;
    min-height: ${minHeight || '200px'};

    > * + * {
      margin-top: 0.75em;
    }

    ul,
    ol {
      padding: 0 1rem;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      line-height: 1.1;
    }

    code {
      background-color: rgba(#616161, 0.1);
      color: #616161;
    }

    pre {
      background: #0d0d0d;
      color: #fff;
      font-family: 'JetBrainsMono', monospace;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;

      code {
        color: inherit;
        padding: 0;
        background: none;
        font-size: 0.8rem;
      }
    }

    img {
      max-width: 100%;
      height: auto;
    }

    blockquote {
      background: #f9f9f9;
      border-left: 10px solid #ccc;
      padding: 8px;
    }
    blockquote:before {
      color: #ccc;
      content: open-quote;
      font-size: 4em;
      line-height: 0.1em;
      margin-right: 0.25em;
      vertical-align: -0.4em;
    }
    blockquote p {
      display: inline;
    }

    hr {
      border: none;
      border-top: 2px solid rgba(#0d0d0d, 0.1);
      margin: 2rem 0;
    }

    table {
      border-collapse: collapse;
      margin: 0;
      overflow: hidden;
      table-layout: fixed;
      width: 100%;
  
      td,
      th {
        border: 2px solid #ced4da;
        box-sizing: border-box;
        min-width: 1em;
        padding: 3px 5px;
        position: relative;
        vertical-align: top;
  
        > * {
          margin-bottom: 0;
        }
      }
  
      th {
        background-color: #f1f3f5;
        font-weight: bold;
        text-align: left;
      }
  
      .selectedCell:after {
        background: rgba(200, 200, 255, 0.4);
        content: "";
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        pointer-events: none;
        position: absolute;
        z-index: 2;
      }
  
      .column-resize-handle {
        background-color: #adf;
        bottom: -2px;
        position: absolute;
        right: -2px;
        pointer-events: none;
        top: 0;
        width: 4px;
      }
  
      p {
        margin: 0;
      }
    }
  }
  
  .tableWrapper {
    padding: 1rem 0;
    overflow-x: auto;
  }
  
  .resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }
  `,
};
