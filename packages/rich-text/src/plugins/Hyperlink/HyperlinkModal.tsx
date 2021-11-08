import * as React from 'react';
import { INLINES } from '@contentful/rich-text-types';
import {
  Modal,
  Form,
  TextField,
  Button,
  SelectField,
  Option,
  FormLabel,
  TextLink,
} from '@contentful/forma-36-react-components';
import { ModalDialogLauncher, FieldExtensionSDK } from '@contentful/field-editor-shared';
import { SPEditor } from '@udecode/plate-core';
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
        <Modal.Content>
          <Form>
            <TextField
              name="linkText"
              id="linkText"
              labelText="Link text"
              value={linkText}
              required={true}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setLinkText(event.target.value)
              }
              textInputProps={{
                testId: 'link-text-input',
              }}
            />

            {enabledLinkTypes.length > 1 && (
              <SelectField
                labelText="Link type"
                value={linkType}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setLinkType(event.target.value)
                }
                name="linkType"
                id="linkType"
                selectProps={{ testId: 'link-type-input' }}>
                {enabledLinkTypes.map((nodeType) => (
                  <Option key={nodeType} value={nodeType}>
                    {LINK_TYPE_SELECTION_VALUES[nodeType]}
                  </Option>
                ))}
              </SelectField>
            )}

            {linkType === INLINES.HYPERLINK && (
              <TextField
                name="linkTarget"
                id="linkTarget"
                labelText="Link target"
                helpText="A protocol may be required, e.g. https://"
                value={linkTarget}
                required={true}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setLinkEntity(null);
                  setLinkTarget(event.target.value);
                }}
                textInputProps={{
                  testId: 'link-target-input',
                }}
              />
            )}

            {linkType !== INLINES.HYPERLINK && (
              <div>
                <FormLabel required htmlFor="">
                  Link target{' '}
                </FormLabel>

                {linkEntity && linkEntity.sys.linkType === SYS_LINK_TYPES[linkType] ? (
                  <>
                    <TextLink onClick={resetLinkEntity} className={styles.removeSelectionLabel}>
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
                      <TextLink onClick={selectEntry}>Select entry</TextLink>
                    )}
                    {linkType === INLINES.ASSET_HYPERLINK && (
                      <TextLink onClick={selectAsset}>Select asset</TextLink>
                    )}
                  </div>
                )}
              </div>
            )}
          </Form>
        </Modal.Content>
        <Modal.Controls>
          <Button
            type="submit"
            buttonType="positive"
            disabled={!isLinkComplete()}
            onClick={handleOnSubmit}
            testId="confirm-cta">
            {props.linkType ? 'Update' : 'Insert'}
          </Button>
          <Button
            type="button"
            onClick={() => props.onClose(null)}
            buttonType="muted"
            testId="cancel-cta">
            Cancel
          </Button>
        </Modal.Controls>
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
  editor: ReactEditor & HistoryEditor & SPEditor,
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
