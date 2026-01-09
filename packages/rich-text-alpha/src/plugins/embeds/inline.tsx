import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { INLINES } from '@contentful/rich-text-types';
import { useIsNodeSelected, type NodeViewComponentProps } from '@handlewithcare/react-prosemirror';
import { css } from 'emotion';
import type { NodeSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
import { assert, object, union, string, literal } from 'superstruct';

import { Node } from '../../core';
import { FetchingWrappedInlineEntryCard } from './components/FetchingWrappedInlineEntryCard';
import { FetchingWrappedResourceInlineCard } from './components/FetchingWrappedResourceInlineCard';
import { select } from './utils';

const styles = {
  container: css({
    display: 'inline-block',
    fontSize: 'inherit',
    padding: `0 ${tokens.spacing2Xs}`,
  }),
};

export class EmbeddedEntity extends Node {
  name = 'embedded_entity';

  schema: NodeSpec = {
    inline: true,
    group: 'inline',
    selectable: true,
    draggable: true,
    attrs: {
      target: {
        validate: (value) => {
          assert(
            value,
            union([
              object({
                sys: object({
                  id: string(),
                  type: literal('Link'),
                  linkType: literal('Entry'),
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
        tag: 'span[data-entity-id][data-entity-type]',
        getAttrs: (el) => ({
          target: {
            sys: {
              id: el.getAttribute('data-entity-id'),
              type: 'Link',
              linkType: el.getAttribute('data-entity-type'),
            },
          },
        }),
      },
      {
        tag: 'span[data-entity-urn][data-entity-type]',
        getAttrs: (el) => ({
          target: {
            sys: {
              urn: el.getAttribute('data-entity-urn'),
              type: 'ResourceLink',
              linkType: el.getAttribute('data-entity-type'),
            },
          },
        }),
      },
    ],
    toDOM: ({ attrs }) => [
      'span',
      {
        'data-entity-id': attrs.target.sys.id,
        'data-entity-urn': attrs.target.sys.urn,
        'data-entity-type': attrs.target.sys.linkType,
      },
    ],
    leafText: () => '',
  };

  selectAndInsert =
    (nodeType: INLINES.EMBEDDED_ENTRY | INLINES.EMBEDDED_RESOURCE): Command =>
    (_state, _dispatch, view) => {
      if (!view) {
        return false;
      }

      if (!_dispatch) {
        return true;
      }

      select({ nodeType, sdk: this.sdk }).then((link) => {
        if (!link) {
          return;
        }

        // The given state and dispatch maybe stale by the time this command
        // is executed. This is why we are using view.* properties to access
        // the latest editor state and dispatch.
        const { state, dispatch } = view;

        dispatch(
          state.tr
            .replaceSelectionWith(
              this.type(state).create({
                target: link,
              }),
            )
            .scrollIntoView(),
        );
      });

      return true;
    };

  shortcuts: Record<string, Command> = {
    'Mod-shift-2': this.selectAndInsert(INLINES.EMBEDDED_ENTRY),
    'Mod-shift-p': this.selectAndInsert(INLINES.EMBEDDED_RESOURCE),
  };

  // eslint-disable-next-line react/display-name -- fix me later
  component = React.forwardRef<HTMLParagraphElement, NodeViewComponentProps>(
    ({ nodeProps, ...props }, ref) => {
      const { target } = nodeProps.node.attrs;
      const isSelected = useIsNodeSelected();

      return (
        <span
          {...props}
          className={styles.container}
          data-entity-id={target.sys.id}
          data-entity-urn={target.sys.urn}
          data-entity-type={target.sys.linkType}
          ref={ref}
        >
          {target.sys.type === 'ResourceLink' ? (
            <FetchingWrappedResourceInlineCard
              sdk={this.sdk}
              link={target}
              isDisabled={false}
              isSelected={isSelected}
              onRemove={() => {
                console.log('remove');
              }}
              onEntityFetchComplete={() => {
                console.log('entity fetch complete');
              }}
            />
          ) : (
            <FetchingWrappedInlineEntryCard
              sdk={this.sdk}
              entryId={target.sys.id}
              isDisabled={false}
              isSelected={isSelected}
              onEdit={() => {
                console.log('edit');
              }}
              onRemove={() => {
                console.log('remove');
              }}
              onEntityFetchComplete={() => {
                console.log('entity fetch complete');
              }}
            />
          )}
        </span>
      );
    },
  );
}
