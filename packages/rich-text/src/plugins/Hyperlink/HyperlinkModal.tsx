import * as React from 'react';

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
import tokens from '@contentful/f36-tokens';
import { EntityProvider } from '@contentful/field-editor-reference';
import { Link } from '@contentful/field-editor-reference';
import { ModalDialogLauncher, FieldAppSDK } from '@contentful/field-editor-shared';
import { INLINES, ResourceLink } from '@contentful/rich-text-types';
import { css } from 'emotion';

import { getNodeEntryFromSelection, insertLink, LINK_TYPES, focus } from '../../helpers/editor';
import getAllowedResourcesForNodeType from '../../helpers/getAllowedResourcesForNodeType';
import getLinkedContentTypeIdsForNodeType from '../../helpers/getLinkedContentTypeIdsForNodeType';
import { isNodeTypeEnabled } from '../../helpers/validations';
import { withoutNormalizing } from '../../internal';
import { getText, isEditorReadOnly } from '../../internal/queries';
import { select } from '../../internal/transforms';
import { PlateEditor, Path } from '../../internal/types';
import { TrackingPluginActions } from '../../plugins/Tracking';
import { FetchingWrappedAssetCard } from '../shared/FetchingWrappedAssetCard';
import { FetchingWrappedEntryCard } from '../shared/FetchingWrappedEntryCard';
import { FetchingWrappedResourceCard } from '../shared/FetchingWrappedResourceCard';

const styles = {
  removeSelectionLabel: css`
    margin-left: ${tokens.spacingS};
    margin-bottom: ${tokens.spacingXs}; // to match FormLabel margin
  `,
};

interface HyperlinkModalProps {
  linkText?: string;
  linkType?: string;
  linkTarget?: string;
  linkEntity?: Link | ResourceLink;
  onClose: (value: unknown) => void;
  sdk: FieldAppSDK;
  readonly: boolean;
}

const SYS_LINK_TYPES = {
  [INLINES.ENTRY_HYPERLINK]: 'Entry',
  [INLINES.ASSET_HYPERLINK]: 'Asset',
  [INLINES.RESOURCE_HYPERLINK]: 'Contentful:Entry',
};

const LINK_TYPE_SELECTION_VALUES = {
  [INLINES.HYPERLINK]: 'URL',
  [INLINES.ENTRY_HYPERLINK]: 'Entry',
  [INLINES.RESOURCE_HYPERLINK]: 'Entry (different space)',
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
  const [linkEntity, setLinkEntity] = React.useState<Link | ResourceLink | null>(
    props.linkEntity ?? null
  );
  const linkTargetInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (linkType === INLINES.HYPERLINK && linkTargetInputRef.current) {
      linkTargetInputRef.current.focus();
    }
  }, [linkType]);

  function isLinkComplete() {
    const isRegularLink = linkType === INLINES.HYPERLINK;
    if (isRegularLink) {
      return !!(linkText && linkTarget);
    }

    const entityLinks: string[] = Object.keys(SYS_LINK_TYPES);
    const isEntityLink = entityLinks.includes(linkType);
    if (isEntityLink) {
      if (linkType === INLINES.ENTRY_HYPERLINK) {
        return !!(linkText && isEntryLink(linkEntity));
      }
      if (linkType === INLINES.ASSET_HYPERLINK) {
        return !!(linkText && isAssetLink(linkEntity));
      }
      if (linkType === INLINES.RESOURCE_HYPERLINK) {
        return !!(linkText && isResourceLink(linkEntity));
      }
      return false;
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

  function entityToResourceLink(entity): Link {
    const { urn } = entity.sys;

    // @ts-expect-error wait for update of app-sdk version
    return { sys: { urn, type: 'ResourceLink', linkType: 'Contentful:Entry' } };
  }

  function isResourceLink(link: Link | ResourceLink | null): link is ResourceLink {
    return !!link && !!(link as ResourceLink).sys.urn;
  }

  function isEntryLink(link: Link | ResourceLink | null): link is Link {
    return !!link && link.sys.type === 'Link' && link.sys.linkType === 'Entry';
  }

  function isAssetLink(link: Link | ResourceLink | null): link is Link {
    return !!link && link.sys.type === 'Link' && link.sys.linkType === 'Asset';
  }

  async function selectEntry() {
    const options = {
      locale: props.sdk.field.locale,
      contentTypes: getLinkedContentTypeIdsForNodeType(props.sdk.field, INLINES.ENTRY_HYPERLINK),
    };
    const entry = await props.sdk.dialogs.selectSingleEntry(options);
    if (entry) {
      setLinkTarget('');
      setLinkEntity(entityToLink(entry));
    }
  }

  async function selectResourceEntry() {
    const options = {
      allowedResources: getAllowedResourcesForNodeType(props.sdk.field, INLINES.RESOURCE_HYPERLINK),
    };
    // @ts-expect-error wait for update of app-sdk version
    const entry = await props.sdk.dialogs.selectSingleResourceEntry(options);
    if (entry) {
      setLinkTarget('');
      setLinkEntity(entityToResourceLink(entry));
    }
  }

  async function selectAsset() {
    const options = {
      locale: props.sdk.field.locale,
    };
    const asset = await props.sdk.dialogs.selectSingleAsset(options);
    if (asset) {
      setLinkTarget('');
      setLinkEntity(entityToLink(asset));
    }
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
                  testId="link-type-input"
                  isDisabled={props.readonly}
                >
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
                  ref={linkTargetInputRef}
                  name="linkTarget"
                  value={linkTarget}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setLinkEntity(null);
                    setLinkTarget(event.target.value);
                  }}
                  testId="link-target-input"
                  isDisabled={props.readonly}
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
                    {!props.readonly && (
                      <TextLink
                        testId="entity-selection-link"
                        onClick={resetLinkEntity}
                        className={styles.removeSelectionLabel}
                      >
                        Remove selection
                      </TextLink>
                    )}
                    <div>
                      {linkType === INLINES.ENTRY_HYPERLINK && isEntryLink(linkEntity) && (
                        <FetchingWrappedEntryCard
                          sdk={props.sdk}
                          locale={props.sdk.field.locale}
                          entryId={linkEntity.sys.id}
                          isDisabled={true}
                          isSelected={false}
                        />
                      )}
                      {linkType === INLINES.RESOURCE_HYPERLINK && isResourceLink(linkEntity) && (
                        <FetchingWrappedResourceCard
                          sdk={props.sdk}
                          link={linkEntity.sys}
                          isDisabled={true}
                          isSelected={false}
                        />
                      )}
                      {linkType === INLINES.ASSET_HYPERLINK && isAssetLink(linkEntity) && (
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
                    {linkType === INLINES.RESOURCE_HYPERLINK && (
                      <TextLink testId="entity-selection-link" onClick={selectResourceEntry}>
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
            size="small"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="positive"
            size="small"
            isDisabled={props.readonly || !isLinkComplete()}
            onClick={handleOnSubmit}
            testId="confirm-cta"
          >
            {props.linkType ? 'Update' : 'Insert'}
          </Button>
        </ModalControls>
      </React.Fragment>
    </EntityProvider>
  );
}

interface HyperLinkDialogData {
  linkTFieldAppSDK;
  linkType: INLINES.HYPERLINK | INLINES.ASSET_HYPERLINK | INLINES.ENTRY_HYPERLINK;
  linkText: string;
  linkTarget?: string;
  linkEntity?: Link;
}

export async function addOrEditLink(
  editor: PlateEditor,
  sdk: FieldAppSDK,
  logAction:
    | TrackingPluginActions['onToolbarAction']
    | TrackingPluginActions['onShortcutAction']
    | TrackingPluginActions['onViewportAction'],
  targetPath?: Path
) {
  const isReadOnly = isEditorReadOnly(editor);
  const selectionBeforeBlur = editor.selection ? { ...editor.selection } : undefined;
  if (!targetPath && !selectionBeforeBlur) return;

  let linkType;
  let linkText;
  let linkTarget;
  let linkEntity;
  const [node, path] = getNodeEntryFromSelection(editor, LINK_TYPES, targetPath);
  if (node && path) {
    linkType = node.type;
    linkText = getText(editor, path);
    linkTarget = (node.data as { uri: string }).uri || '';
    linkEntity = (node.data as { target: Link }).target;
  }

  const selectionAfterFocus =
    targetPath ?? (selectionBeforeBlur as NonNullable<typeof selectionBeforeBlur>);

  const currentLinkText = linkText || (editor.selection ? getText(editor, editor.selection) : '');
  const isEditing = Boolean(node && path);

  logAction(isEditing ? 'openEditHyperlinkDialog' : 'openCreateHyperlinkDialog');

  const data = await ModalDialogLauncher.openDialog(
    {
      title: isEditing ? 'Edit hyperlink' : 'Insert hyperlink',
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
          readonly={isReadOnly}
        />
      );
    }
  );
  select(editor, selectionAfterFocus);

  if (!data) {
    focus(editor);
    logAction(isEditing ? 'cancelEditHyperlinkDialog' : 'cancelCreateHyperlinkDialog');
    return;
  }

  const {
    linkText: text,
    linkTarget: url,
    linkType: type,
    linkEntity: target,
  } = data as HyperLinkDialogData;

  withoutNormalizing(editor, () => {
    insertLink(editor, { text, url, type, target, path });
  });

  logAction(isEditing ? 'edit' : 'insert', {
    nodeType: type,
    linkType: target?.sys.linkType ?? 'uri', // we want to keep the same values we've been using for the old editor, which can be `uri`, `Asset` or `Entry`
  });

  focus(editor);
}
