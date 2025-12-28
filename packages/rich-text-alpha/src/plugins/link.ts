import { toggleMark } from 'prosemirror-commands';
import type { MarkSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';

import { Mark } from '../core';
import { invariant } from '../core/utils';


const types = ['URL', 'Entry', 'Asset', 'Contentful:Entry'] as const;

export class Link extends Mark {
  name = 'link';

  schema: MarkSpec = {
    inclusive: false,
    attrs: {
      href: { validate: 'string' },
      type: {
        validate: (value) =>
          invariant(
            types.includes(value),
            `Link type must be one of the following: ${types.join(', ')}`,
          ),
      },
    },
    parseDOM: [
      {
        tag: types.map((t) => `a[href][data-link-type="${t}"]`).join(','),
        getAttrs(dom: HTMLElement) {
          return {
            href: dom.getAttribute('href'),
            type: dom.getAttribute('data-link-type'),
          };
        },
      },
    ],
    toDOM: ({ attrs: { href, type } }) => {
      return [
        'a',
        {
          href,
          'data-link-type': type,
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
        0,
      ];
    },
  };

  toggleLink: Command = (state, dispatch, view) => {
    const type = this.markType(state);

    if (!view) {
      throw new Error('command toggleLink requires a view parameter');
    }

    if (this.isActive(state)) {
      return toggleMark(type)(state, dispatch);
    }

    // The given state and dispatch maybe stale by the time this command is
    // executed. This is why we are using view.* properties to access the
    // latest editor state and dispatch.
    toggleMark(type, {
      type: 'URL',
      href: 'https://www.google.com',
    })(view.state, view.dispatch);

    return true;
  };

  shortcuts: Record<string, Command> = {
    'Mod-k': this.toggleLink,
  };
}
