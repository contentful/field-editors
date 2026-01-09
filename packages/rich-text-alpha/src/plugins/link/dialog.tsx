import * as React from 'react';

import {
  Button,
  Form,
  FormControl,
  FormLabel,
  ModalContent,
  ModalControls,
  Select,
  TextInput,
  TextLink,
} from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { EntityProvider, Entity } from '@contentful/field-editor-reference';
import { FieldAppSDK, ModalDialogLauncher } from '@contentful/field-editor-shared';
import { INLINES, ResourceLink, Link } from '@contentful/rich-text-types';
import { css } from 'emotion';
import type { Except, SetRequired } from 'type-fest';

import { FetchingWrappedAssetCard } from '../../components/FetchingWrappedAssetCard';
import { FetchingWrappedEntryCard } from '../../components/FetchingWrappedEntryCard';
import { FetchingWrappedResourceCard } from '../../components/FetchingWrappedResourceCard';
import {
  isNodeEnabled,
  getLinkedContentTypeIdsForNodeType,
  getAllowedResourcesForNodeType,
} from '../../core/validation';
import { DEFAULT_LINK_TYPE, getLinkType, LINK_TYPES, type LinkType, type Hyperlink } from './types';

const styles = {
  removeSelectionLabel: css`
    margin-left: ${tokens.spacingS};
    margin-bottom: ${tokens.spacingXs}; // to match FormLabel margin
  `,
};

interface DialogData {
  text: string;
  hyperlink: Hyperlink;
}

interface ModalProps {
  sdk: FieldAppSDK;
  readonly?: boolean;
  text?: string;
  hyperlink?: Hyperlink;
  onClose: (value: DialogData | null) => void;
}

const LINK_TYPE_SELECTION_VALUES: Record<string, string> = {
  [INLINES.HYPERLINK]: 'URL',
  [INLINES.ENTRY_HYPERLINK]: 'Entry',
  [INLINES.ASSET_HYPERLINK]: 'Asset',
  [INLINES.RESOURCE_HYPERLINK]: 'Entry (different space)',
};

function Modal(props: ModalProps) {
  const { sdk } = props;
  const enabledLinkTypes = LINK_TYPES.filter((nodeType) => isNodeEnabled(sdk.field, nodeType));

  const [text, setText] = React.useState(props.text ?? '');

  const [linkType, setLinkType] = React.useState(
    props.hyperlink ? getLinkType(props.hyperlink) : DEFAULT_LINK_TYPE,
  );

  const [hyperlink, setHyperlink] = React.useState<Hyperlink>(
    props.hyperlink ?? {
      uri: null,
      target: null,
    },
  );

  const isEditing = !!props.hyperlink;

  function isLinkComplete() {
    if (!text) {
      return false;
    }

    switch (linkType) {
      case INLINES.HYPERLINK:
        return !!hyperlink.uri;
      case INLINES.ENTRY_HYPERLINK:
        return !!hyperlink.target && isEntryLink(hyperlink.target);
      case INLINES.ASSET_HYPERLINK:
        return !!hyperlink.target && isAssetLink(hyperlink.target);
      case INLINES.RESOURCE_HYPERLINK:
        return !!hyperlink.target && isResourceLink(hyperlink.target);
      default:
        return false;
    }
  }

  function handleOnSubmit(event: Event | React.FormEvent) {
    event.preventDefault();

    props.onClose({ text, hyperlink });
  }

  function entityToLink(entity: Entity): Link<'Entry' | 'Asset'> {
    const { id, type } = entity.sys;

    return { sys: { id, type: 'Link', linkType: type } } as Link<'Entry' | 'Asset'>;
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
    const entry = await sdk.dialogs.selectSingleEntry<Entity>({
      locale: sdk.field.locale,
      contentTypes: getLinkedContentTypeIdsForNodeType(sdk.field, INLINES.ENTRY_HYPERLINK),
      // @ts-expect-error kept from old code. Is this actually supported?
      recommendations: {
        searchQuery: props.text,
      },
    });

    if (entry) {
      setHyperlink({
        uri: null,
        target: entityToLink(entry),
      });
    }
  }

  async function selectResourceEntry() {
    // @ts-expect-error wait for update of app-sdk version
    const entityLink = await sdk.dialogs.selectSingleResourceEntity({
      allowedResources: getAllowedResourcesForNodeType(sdk.field, INLINES.RESOURCE_HYPERLINK),
      locale: sdk.field.locale,
      referencingEntryId: sdk.ids.entry,
    });

    if (entityLink) {
      setHyperlink({
        uri: null,
        target: entityLink,
      });
    }
  }

  async function selectAsset() {
    const asset = await sdk.dialogs.selectSingleAsset<Entity>({
      locale: sdk.field.locale,
    });

    if (asset) {
      setHyperlink({
        uri: null,
        target: entityToLink(asset),
      });
    }
  }

  function resetLinkEntity(event: React.MouseEvent) {
    event.preventDefault();

    setHyperlink({
      uri: null,
      target: null,
    });
  }

  return (
    <EntityProvider sdk={sdk}>
      <React.Fragment>
        <ModalContent>
          <Form onSubmit={handleOnSubmit}>
            {!isEditing && (
              <FormControl id="link-text" isRequired>
                <FormControl.Label>Link text</FormControl.Label>
                <TextInput
                  testId="link-text-input"
                  name="link-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                />
              </FormControl>
            )}

            {enabledLinkTypes.length > 1 && (
              <FormControl id="link-type">
                <FormControl.Label>Link type</FormControl.Label>
                <Select
                  value={linkType}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                    setLinkType(event.target.value as LinkType)
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
                  name="linkTarget"
                  value={hyperlink.uri ?? ''}
                  onChange={(event) => {
                    setHyperlink((prev) => ({
                      ...prev,
                      uri: event.target.value,
                    }));
                  }}
                  testId="link-target-input"
                  isDisabled={props.readonly}
                />
                <FormControl.HelpText>
                  A protocol may be required, e.g. https://
                </FormControl.HelpText>
              </FormControl>
            )}

            {linkType !== INLINES.HYPERLINK && hyperlink.target && (
              <div>
                <FormLabel isRequired>Link target </FormLabel>
                {!props.readonly && (
                  <TextLink
                    testId="entity-selection-link"
                    onClick={resetLinkEntity}
                    className={styles.removeSelectionLabel}
                  >
                    Remove selection
                  </TextLink>
                )}
              </div>
            )}

            {/* Entry target */}
            {linkType === INLINES.ENTRY_HYPERLINK && isEntryLink(hyperlink.target) ? (
              <FetchingWrappedEntryCard
                sdk={sdk}
                locale={sdk.field.locale}
                entryId={hyperlink.target.sys.id}
                isDisabled={true}
                isSelected={false}
              />
            ) : (
              <TextLink testId="entity-selection-link" onClick={selectEntry}>
                Select entry
              </TextLink>
            )}

            {/* Asset target */}
            {linkType === INLINES.ASSET_HYPERLINK && isAssetLink(hyperlink.target) ? (
              <FetchingWrappedAssetCard
                sdk={sdk}
                locale={sdk.field.locale}
                assetId={hyperlink.target.sys.id}
                isDisabled={true}
                isSelected={false}
              />
            ) : (
              <TextLink testId="entity-selection-link" onClick={selectAsset}>
                Select asset
              </TextLink>
            )}

            {/* Resource target */}
            {linkType === INLINES.RESOURCE_HYPERLINK && isResourceLink(hyperlink.target) ? (
              <FetchingWrappedResourceCard
                sdk={sdk}
                link={hyperlink.target.sys}
                isDisabled={true}
                isSelected={false}
              />
            ) : (
              <TextLink testId="entity-selection-link" onClick={selectResourceEntry}>
                Select entry
              </TextLink>
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
            {isEditing ? 'Update' : 'Insert'}
          </Button>
        </ModalControls>
      </React.Fragment>
    </EntityProvider>
  );
}

async function openDialog(title: string, props: Except<ModalProps, 'onClose'>) {
  const data = await ModalDialogLauncher.openDialog(
    {
      title,
      width: 'large',
      shouldCloseOnEscapePress: true,
      shouldCloseOnOverlayClick: true,
      allowHeightOverflow: true,
    },
    ({ onClose }) => {
      return <Modal {...props} onClose={onClose} />;
    },
  );

  return data as DialogData | null;
}

export function addLink(props: Except<ModalProps, 'onClose' | 'hyperlink'>) {
  return openDialog('Insert hyperlink', props);
}

export function editLink(props: SetRequired<Except<ModalProps, 'onClose'>, 'hyperlink' | 'text'>) {
  return openDialog('Edit hyperlink', props);
}
