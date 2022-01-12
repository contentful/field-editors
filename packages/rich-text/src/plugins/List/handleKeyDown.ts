// import { BLOCKS } from '@contentful/rich-text-types';
// import { HotkeyPlugin, KeyboardHandler } from '@udecode/plate-core';
// import { getListItemEntry } from '@udecode/plate-list';
// import { Node, Path, Transforms } from 'slate';

// /**
//  * Handles an 'entry' keydown event within a list item
//  * by moving the sibling list node below that list item
//  * to the next line below that list.
//  *
//  * e.g.
//  * - foo
//  *   bar
//  *   qux
//  *
//  * Hitting enter between the o's of "foo" should result in
//  * - fo
//  * - o
//  * - bar
//  * - qux
//  *
//  * This works out of the box
//  */
// const handleEntryEvent = (editor, pathToList, pathToListItem) => {
//   const children = Array.from(Node.children(editor, pathToListItem));
//   const pivot = editor.selection.focus.path[pathToListItem.length];
//   const siblingsBelowCurrentListItem = children.slice(pivot + 1);
//   Transforms.insertNodes(
//     editor,
//     { type: BLOCKS.LIST_ITEM, data: {}, children: siblingsBelowCurrentListItem.map(([node]) => node) },
//     { at: pathToListItem }
//   );
//   for (const [, path] of siblingsBelowCurrentListItem) {
//     Transforms.removeNodes(editor, { at: path });
//   }
// };

// export const handleKeyDown: KeyboardHandler<{}, HotkeyPlugin> =
//   (editor) =>
//   (event: React.KeyboardEvent): void => {
//     if (!editor.selection || event.key !== 'Enter') return;
//     const { list, listItem } = getListItemEntry(editor) || {};
//     if (list && listItem) {
//       const isEntryEvent = event.key === 'Enter';
//       if (isEntryEvent) {
//         const [, pathToList] = list;
//         const [, pathToListItem] = listItem;
//         handleEntryEvent(editor, pathToList, pathToListItem)
//       }
//     }
//   };
