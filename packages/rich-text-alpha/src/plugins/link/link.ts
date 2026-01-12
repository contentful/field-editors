import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import type { MarkSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
import { assert, enums, object, union, string, literal } from 'superstruct';

import { Mark } from '../../core';
import { addLink } from './dialog';

const styles = {
  link: css({
    color: tokens.blue600,
    fontWeight: tokens.fontWeightMedium,
    textDecoration: 'none',
    '&:hover, &:focus': {
      color: tokens.blue700,
    },
  }),
};

export class Link extends Mark {
  name = 'link';

  schema: MarkSpec = {
    inclusive: false,
    attrs: {
      uri: {
        default: null,
        validate: 'string|null',
      },
      target: {
        default: null,
        validate: (value) => {
          assert(
            value,
            union([
              literal(null),
              object({
                sys: object({
                  id: string(),
                  type: literal('Link'),
                  linkType: enums(['Entry', 'Asset']),
                }),
              }),
              object({
                sys: object({
                  urn: string(),
                  type: literal('ResourceLink'),
                  linkType: literal('Contentful:Entry'),
                }),
              }),
            ]),
          );
        },
      },
    },
    parseDOM: [
      {
        tag: `a[data-link-id][data-link-type]`,
        getAttrs: (el) => ({
          uri: el.getAttribute('href'),
          target: {
            sys: {
              id: el.getAttribute('data-link-id'),
              linkType: el.getAttribute('data-link-type'),
              type: 'Link',
            },
          },
        }),
      },
      {
        tag: `a[data-resource-link-urn][data-resource-link-type]`,
        getAttrs: (el) => ({
          uri: el.getAttribute('href'),
          target: {
            sys: {
              urn: el.getAttribute('data-resource-link-urn'),
              linkType: el.getAttribute('data-resource-link-type'),
              type: 'ResourceLink',
            },
          },
        }),
      },
      {
        tag: `a[href]`,
        getAttrs: (el) => ({
          uri: el.getAttribute('href'),
        }),
      },
    ],
    toDOM: ({ attrs: { uri, target } }) => {
      const dataAttrs = target
        ? target.sys.linkType === 'Link'
          ? {
              'data-link-id': target.sys.id,
              'data-link-type': target.sys.linkType,
            }
          : {
              'data-resource-link-urn': target.sys.urn,
              'data-resource-link-type': target.sys.linkType,
            }
        : {};

      return ['a', { href: uri, class: styles.link, ...dataAttrs }, 0];
    },
  };

  removeLink: Command = (state, dispatch) => {
    const type = this.type(state);
    const range = this.getMarkRange(state);

    if (!range) {
      return false;
    }

    dispatch?.(state.tr.removeMark(range.from, range.to, type));

    return true;
  };

  toggleLink: Command = (state, dispatch, view) => {
    const type = this.type(state);

    if (!view) {
      throw new Error('command toggleLink requires a view parameter');
    }

    if (this.isActive(state)) {
      return this.removeLink(state, dispatch);
    }

    const { selection } = state;

    const selectionText = state.doc.textBetween(selection.from, selection.to);

    addLink({
      sdk: this.sdk,
      text: selectionText,
      readonly: false,
    }).then((data): void => {
      if (!data) {
        return;
      }

      const { text, hyperlink } = data;

      console.log({ text, hyperlink });
      // The given state and dispatch maybe stale by the time this command is
      // executed. This is why we are using view.* properties to access the
      // latest editor state and dispatch.
      const { state, dispatch } = view;

      const mark = type.create(hyperlink);
      const { from, to } = state.selection;

      if (!selectionText) {
        dispatch(
          state.tr
            .insertText(text)
            .addMark(from, to + text.length, mark)
            .scrollIntoView(),
        );
      } else {
        dispatch(
          state.tr
            .replaceSelectionWith(state.schema.text(text))
            .addMark(from, to + text.length, mark)
            .scrollIntoView(),
        );
      }
    });

    return true;
  };

  shortcuts: Record<string, Command> = {
    'Mod-k': this.toggleLink,
  };
}
