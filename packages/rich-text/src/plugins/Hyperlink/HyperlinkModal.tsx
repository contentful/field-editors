import * as React from 'react';
import { INLINES } from '@contentful/rich-text-types';
import {
  TextLink,
  Button,
  FormControl,
  FormLabel,
  Select,
  TextInput,
  Form,
  ModalContent,
  ModalControls,
} from '@contentful/f36-components';
import { ModalDialogLauncher, FieldExtensionSDK } from '@contentful/field-editor-shared';
import { PlateEditor } from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';
import { EntityProvider } from '@contentful/field-editor-reference';
import { Link } from '@contentful/field-editor-reference/dist/types';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';
import { getNodeEntryFromSelection, insertLink, LINK_TYPES } from '../../helpers/editor';
import { FetchingWrappedEntryCard } from '../shared/FetchingWrappedEntryCard';
import { FetchingWrappedAssetCard } from '../shared/FetchingWrappedAssetCard';
import getLinkedContentTypeIdsForNodeType from '../../helpers/getLinkedContentTypeIdsForNodeType';
import { isNodeTypeEnabled } from '../../helpers/validations';

const styles = {
  removeSelectionLabel: css`
    margin-left: ${tokens.spacingS};
  `,
};

interface HyperlinkModalProps {
  linkText?: string;
  linkType?: string;
  linkTarget?: string;
  linkEntity?: Link;
  onClose: (value: unknown) => void;
  sdk: FieldExtensionSDK;
}

const SYS_LINK_TYPES = {
  [INLINES.ENTRY_HYPERLINK]: 'Entry',
  [INLINES.ASSET_HYPERLINK]: 'Asset',
};

const LINK_TYPE_SELECTION_VALUES = {
  [INLINES.HYPERLINK]: 'URL',
  [INLINES.ENTRY_HYPERLINK]: 'Entry',
  [INLINES.ASSET_HYPERLINK]: 'Asset',
};

export function HyperlinkModal(props: HyperlinkModalProps) {
  const enabledLinkTypes = LINK_TYPES.filter((nodeType) =>
    isNodeTypeEnabled(props.sdk.field, nodeType)
  );
  const [defaultLinkType] = enabledLinkTypes;
  const [linkText, setLinkText] = React.useState(props.linkText ?? '');
  const [linkType, setLinkType] = React.useState(props.linkType ?? defaultLinkType);
  const [linkTarget, setLinkTarget] = React.useState(props.linkTarget ?? '');
  const [linkEntity, setLinkEntity] = React.useState<Link | null>(props.linkEntity ?? null);

  function isLinkComplete() {
    const isRegularLink = linkType === INLINES.HYPERLINK;
    if (isRegularLink) {
      return !!(linkText && linkTarget);
    }

    const entityLinks: string[] = Object.keys(SYS_LINK_TYPES);
    const isEntityLink = entityLinks.includes(linkType);
    if (isEntityLink) {
      return !!(linkText && linkEntity);
    }

    return false;
  }

  function handleOnSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    props.onClose({ linkText, linkType, linkTarget, linkEntity });
  }

  function entityToLink(entity): Link {
    const { id, type } = entity.sys;

    return { sys: { id, type: 'Link', linkType: type } };
  }

  async function selectEntry() {
    const options = {
      locale: props.sdk.field.locale,
      contentTypes: getLinkedContentTypeIdsForNodeType(props.sdk.field, INLINES.ENTRY_HYPERLINK),
    };
    const entry = await props.sdk.dialogs.selectSingleEntry(options);
    setLinkTarget('');
    setLinkEntity(entityToLink(entry));
  }

  async function selectAsset() {
    const options = {
      locale: props.sdk.field.locale,
    };
    const asset = await props.sdk.dialogs.selectSingleAsset(options);
    setLinkTarget('');
    setLinkEntity(entityToLink(asset));
  }

  function resetLinkEntity(event: React.MouseEvent) {
    event.preventDefault();

    setLinkEntity(null);
  }

  return (
    <EntityProvider sdk={props.sdk}>
      <React.Fragment>
        <ModalContent>
          <Form>
            {!props.linkType && (
              <FormControl id="link-text" isRequired>
                <FormControl.Label>Link text</FormControl.Label>
                <TextInput
                  testId="link-text-input"
                  name="link-text"
                  value={linkText}
                  onChange={(event) => setLinkText(event.target.value)}
                />
              </FormControl>
            )}

            {enabledLinkTypes.length > 1 && (
              <FormControl id="link-type">
                <FormControl.Label>Link type</FormControl.Label>
                <Select
                  value={linkType}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                    setLinkType(event.target.value)
                  }
                  testId="link-type-input">
                  {enabledLinkTypes.map((nodeType) => (
                    <Select.Option key={nodeType} value={nodeType}>
                      {LINK_TYPE_SELECTION_VALUES[nodeType]}
                    </Select.Option>
                  ))}
                </Select>
              </FormControl>
            )}

            {linkType === INLINES.HYPERLINK && (
              <FormControl id="linkTarget" isRequired>
                <FormControl.Label>Link target</FormControl.Label>
                <TextInput
                  name="linkTarget"
                  value={linkTarget}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setLinkEntity(null);
                    setLinkTarget(event.target.value);
                  }}
                  testId="link-target-input"
                />
                <FormControl.HelpText>
                  A protocol may be required, e.g. https://
                </FormControl.HelpText>
              </FormControl>
            )}

            {linkType !== INLINES.HYPERLINK && (
              <div>
                <FormLabel isRequired htmlFor="">
                  Link target{' '}
                </FormLabel>

                {linkEntity && linkEntity.sys.linkType === SYS_LINK_TYPES[linkType] ? (
                  <>
                    <TextLink
                      testId="entity-selection-link"
                      onClick={resetLinkEntity}
                      className={styles.removeSelectionLabel}>
                      Remove selection
                    </TextLink>
                    <div>
                      {linkType === INLINES.ENTRY_HYPERLINK && (
                        <FetchingWrappedEntryCard
                          sdk={props.sdk}
                          locale={props.sdk.field.locale}
                          entryId={linkEntity.sys.id}
                          isDisabled={true}
                          isSelected={false}
                        />
                      )}
                      {linkType === INLINES.ASSET_HYPERLINK && (
                        <FetchingWrappedAssetCard
                          sdk={props.sdk}
                          locale={props.sdk.field.locale}
                          assetId={linkEntity.sys.id}
                          isDisabled={true}
                          isSelected={false}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    {linkType === INLINES.ENTRY_HYPERLINK && (
                      <TextLink testId="entity-selection-link" onClick={selectEntry}>
                        Select entry
                      </TextLink>
                    )}
                    {linkType === INLINES.ASSET_HYPERLINK && (
                      <TextLink testId="entity-selection-link" onClick={selectAsset}>
                        Select asset
                      </TextLink>
                    )}
                  </div>
                )}
              </div>
            )}
          </Form>
        </ModalContent>
        <ModalControls>
          <Button
            type="button"
            onClick={() => props.onClose(null)}
            variant="secondary"
            testId="cancel-cta"
            size="small">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="positive"
            size="small"
            isDisabled={!isLinkComplete()}
            onClick={handleOnSubmit}
            testId="confirm-cta">
            {props.linkType ? 'Update' : 'Insert'}
          </Button>
        </ModalControls>
      </React.Fragment>
    </EntityProvider>
  );
}

interface HyperLinkDialogData {
  linkText: string;
  linkType: INLINES.HYPERLINK | INLINES.ASSET_HYPERLINK | INLINES.ENTRY_HYPERLINK;
  linkTarget?: string;
  linkEntity?: Link;
}

export async function addOrEditLink(
  editor: ReactEditor & HistoryEditor & PlateEditor,
  sdk: FieldExtensionSDK
) {
  if (!editor.selection) return;

  let linkType;
  let linkText;
  let linkTarget;
  let linkEntity;

  const [node, path] = getNodeEntryFromSelection(editor, LINK_TYPES);
  if (node && path) {
    linkType = node.type;
    linkText = Editor.string(editor, path);
    linkTarget = (node.data as { uri: string }).uri || '';
    linkEntity = (node.data as { target: Link }).target;
  }

  const selectionBeforeBlur = { ...editor.selection };
  const currentLinkText = linkText || Editor.string(editor, editor.selection);

  const data = await ModalDialogLauncher.openDialog(
    {
      title: linkType ? 'Edit hyperlink' : 'Insert hyperlink',
      width: 'large',
      shouldCloseOnEscapePress: true,
      shouldCloseOnOverlayClick: true,
      allowHeightOverflow: true,
    },
    ({ onClose }) => {
      return (
        <HyperlinkModal
          linkTarget={linkTarget}
          linkText={currentLinkText}
          linkType={linkType}
          linkEntity={linkEntity}
          onClose={onClose}
          sdk={sdk}
        />
      );
    }
  );

  if (!data) return;

  const {
    linkText: text,
    linkTarget: url,
    linkType: type,
    linkEntity: target,
  } = data as HyperLinkDialogData;

  Transforms.select(editor, selectionBeforeBlur);

  insertLink(editor, { text, url, type, target, path });

  ReactEditor.focus(editor);
}
