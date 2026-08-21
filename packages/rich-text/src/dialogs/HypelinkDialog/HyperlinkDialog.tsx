import * as React from 'react';

import { DialogAppSDK, DialogsAPI, type SerializedJSONValue } from '@contentful/app-sdk';
import {
  Button,
  Form,
  FormControl,
  FormLabel,
  ModalContent,
  ModalControls,
  Select,
  TextInput,
  TextLink
} from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { EntityProvider } from '@contentful/field-editor-reference';
import { FieldAppSDK } from '@contentful/field-editor-shared';
import { css } from '@emotion/css';
import { t } from '@lingui/core/macro';

import { FetchingWrappedAssetCard } from '../../plugins/shared/FetchingWrappedAssetCard';
import { FetchingWrappedEntryCard } from '../../plugins/shared/FetchingWrappedEntryCard';

export const LINK_TYPES = {
  URI: 'uri',
  ENTRY: 'Entry',
  ASSET: 'Asset'
} as const;

type LinkType = (typeof LINK_TYPES)[keyof typeof LINK_TYPES];

type EntityLink = {
  sys: {
    id: string;
    type: 'Link';
    linkType: string;
  };
};

type SelectableEntity = {
  sys: {
    id: string;
    type: string;
  };
};

type EntitySelectorConfigs = {
  Entry?: {
    locale?: string;
    contentTypes?: string[];
  };
  Asset?: {
    locale?: string;
  };
};

type HyperlinkValue = {
  text?: string;
  uri?: string;
  target?: EntityLink | null;
  type?: string;
};

type HyperlinkDialogProps = {
  sdk: DialogAppSDK;
  labels?: {
    title?: string;
    confirm?: string;
  };
  value?: HyperlinkValue;
  entitySelectorConfigs?: EntitySelectorConfigs;
  allowedHyperlinkTypes?: LinkType[];
  hideText?: boolean;
  onClose: (value: HyperlinkValue | null) => void;
};

type OpenHyperlinkDialogOptions = {
  value: HyperlinkValue;
  showTextInput?: boolean;
  allowedHyperlinkTypes?: LinkType[];
  entitySelectorConfigs?: EntitySelectorConfigs;
};

type HyperlinkDialogState = {
  text?: string;
  uri?: string;
  entityLinks: Record<string, EntityLink | null | undefined>;
  type?: string;
};

const DEFAULT_ALLOWED_HYPERLINK_TYPES = [LINK_TYPES.ENTRY, LINK_TYPES.ASSET, LINK_TYPES.URI];
const LEGACY_REQUIRED_FORM_LABEL_PROPS = { required: true };
const LEGACY_LINK_TYPE_FORM_CONTROL_PROPS = { name: 'link-type' };

function isFeaturingEntitySelector(entitySelectorConfigs: EntitySelectorConfigs = {}) {
  return !!entitySelectorConfigs.Entry || !!entitySelectorConfigs.Asset;
}

function entityToLink(entity: SelectableEntity): EntityLink {
  const { id, type } = entity.sys;
  return { sys: { id, type: 'Link', linkType: type } };
}

function getInitialState(
  value: HyperlinkValue,
  allowedHyperlinkTypes: LinkType[]
): HyperlinkDialogState {
  const { text, type, uri, target } = value;
  const isEntityLink = Boolean(target);
  const entityLinks: HyperlinkDialogState['entityLinks'] = {
    [LINK_TYPES.ENTRY]: null,
    [LINK_TYPES.ASSET]: null
  };
  let linkType = type;

  if (target && isEntityLink) {
    linkType = target.sys.linkType;
    entityLinks[linkType] = target;
  } else if (allowedHyperlinkTypes.includes(LINK_TYPES.URI)) {
    linkType = LINK_TYPES.URI;
  } else {
    linkType = allowedHyperlinkTypes[0];
  }

  return {
    text,
    uri,
    entityLinks,
    type: linkType
  };
}

export function HyperlinkDialog({
  sdk,
  labels,
  value = {},
  entitySelectorConfigs = {},
  allowedHyperlinkTypes = DEFAULT_ALLOWED_HYPERLINK_TYPES,
  hideText = false,
  onClose
}: HyperlinkDialogProps) {
  const [state, setState] = React.useState(() => getInitialState(value, allowedHyperlinkTypes));

  const setTargetEntity = (type: LinkType, entity: SelectableEntity | null) => {
    setState((currentState) => ({
      ...currentState,
      entityLinks: {
        ...currentState.entityLinks,
        [type]: entity ? entityToLink(entity) : undefined
      }
    }));
  };

  const getValue = (): HyperlinkValue => {
    const { text, type, uri } = state;
    const linkValue: HyperlinkValue = { type };
    if (text) {
      linkValue.text = text;
    }
    if (type === LINK_TYPES.URI) {
      linkValue.uri = uri;
    } else {
      linkValue.target = type ? state.entityLinks[type] : undefined;
    }
    return linkValue;
  };

  const isLinkComplete = () => {
    const { text, type, uri, target } = getValue();
    const requiresText = !hideText;
    if (requiresText && !text) {
      return false;
    }
    return (type === LINK_TYPES.URI && uri) || target;
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    onClose(getValue());
  };

  const selectEntry = async () => {
    const { locale, contentTypes } = entitySelectorConfigs.Entry!;
    const entry = await sdk.dialogs.selectSingleEntry({ locale, contentTypes });
    setTargetEntity(LINK_TYPES.ENTRY, entry as SelectableEntity | null);
  };

  const selectAsset = async () => {
    const { locale } = entitySelectorConfigs.Asset!;
    const asset = await sdk.dialogs.selectSingleAsset({ locale });
    setTargetEntity(LINK_TYPES.ASSET, asset as SelectableEntity | null);
  };

  const resolvedLabels = labels || {
    title: t({
      id: 'FieldEditors.RichText.HyperlinkDialog.DefaultTitle',
      message: 'Insert link'
    }),
    confirm: t({
      id: 'FieldEditors.RichText.HyperlinkDialog.DefaultConfirm',
      message: 'Insert link'
    })
  };

  const { uri, text, type, entityLinks } = state;
  const isUriInputAutoFocused = type === LINK_TYPES.URI && (hideText || !!text);
  const renderEntitySelector = (entityType?: string) => (
    <div className={css({ marginTop: tokens.spacingS })}>
      {entityType === LINK_TYPES.ENTRY && (
        <TextLink as="button" onClick={selectEntry}>
          {t({
            id: 'FieldEditors.RichText.HyperlinkDialog.SelectEntry',
            message: 'Select entry'
          })}
        </TextLink>
      )}
      {entityType === LINK_TYPES.ASSET && (
        <TextLink as="button" onClick={selectAsset}>
          {t({
            id: 'FieldEditors.RichText.HyperlinkDialog.SelectAsset',
            message: 'Select asset'
          })}
        </TextLink>
      )}
    </div>
  );

  const renderEntityField = () => {
    if (type === LINK_TYPES.URI) {
      return null;
    }
    const resetEntity = () => type && setTargetEntity(type as LinkType, null);
    const entityLink = type ? entityLinks[type] : undefined;
    const isEntitySelectorVisible = !entityLink;
    return (
      <div>
        <FormLabel {...LEGACY_REQUIRED_FORM_LABEL_PROPS} htmlFor="">
          {t({ id: 'FieldEditors.RichText.HyperlinkDialog.LinkTarget', message: 'Link target' })}
        </FormLabel>
        {!isEntitySelectorVisible && (
          <TextLink
            as="button"
            className={css({ marginLeft: tokens.spacingS })}
            onClick={resetEntity}
          >
            {t({
              id: 'FieldEditors.RichText.HyperlinkDialog.RemoveSelection',
              message: 'Remove selection'
            })}
          </TextLink>
        )}
        {entityLink && (
          <div>
            {type === LINK_TYPES.ENTRY && (
              <FetchingWrappedEntryCard
                sdk={sdk as unknown as FieldAppSDK}
                locale={entitySelectorConfigs.Entry!.locale!}
                entryId={entityLink.sys.id}
                isDisabled
                isSelected={false}
              />
            )}
            {type === LINK_TYPES.ASSET && (
              <FetchingWrappedAssetCard
                sdk={sdk as unknown as FieldAppSDK}
                locale={entitySelectorConfigs.Asset!.locale!}
                assetId={entityLink.sys.id}
                isDisabled
                isSelected={false}
              />
            )}
          </div>
        )}
        {/* Keep all entity selectors in the DOM for super fast types switching ux.*/}
        {isEntitySelectorVisible && renderEntitySelector(type)}
      </div>
    );
  };

  return (
    <EntityProvider sdk={sdk}>
      <>
        <ModalContent>
          <Form>
            {hideText ? null : (
              <FormControl id="link-text" isRequired>
                <FormControl.Label>
                  {t({
                    id: 'FieldEditors.RichText.HyperlinkDialog.LinkText',
                    message: 'Link text'
                  })}
                </FormControl.Label>
                <TextInput
                  testId="link-text-input"
                  name="link-text"
                  value={text || ''}
                  onChange={(event) =>
                    setState((currentState) => ({
                      ...currentState,
                      text: event.target.value
                    }))
                  }
                  // eslint-disable-next-line -- TODO: describe this disable  jsx-a11y/no-autofocus
                  autoFocus={!isUriInputAutoFocused}
                />
              </FormControl>
            )}
            {isFeaturingEntitySelector(entitySelectorConfigs) && (
              <FormControl id="link-type" {...LEGACY_LINK_TYPE_FORM_CONTROL_PROPS}>
                <FormControl.Label>
                  {t({
                    id: 'FieldEditors.RichText.HyperlinkDialog.LinkType',
                    message: 'Link type'
                  })}
                </FormControl.Label>
                <Select
                  value={type}
                  onChange={(event) =>
                    setState((currentState) => ({
                      ...currentState,
                      type: event.target.value as LinkType
                    }))
                  }
                  testId="link-type-select"
                >
                  {/* Show the option if the link type is allowed or the current link is of type that is no longer valid */}
                  {allowedHyperlinkTypes.includes(LINK_TYPES.URI) || type === LINK_TYPES.URI ? (
                    <Select.Option value={LINK_TYPES.URI}>
                      {t({ id: 'FieldEditors.RichText.HyperlinkDialog.URL', message: 'URL' })}
                    </Select.Option>
                  ) : null}
                  {allowedHyperlinkTypes.includes(LINK_TYPES.ENTRY) || type === LINK_TYPES.ENTRY ? (
                    <Select.Option value={LINK_TYPES.ENTRY}>
                      {t({ id: 'FieldEditors.RichText.HyperlinkDialog.Entry', message: 'Entry' })}
                    </Select.Option>
                  ) : null}
                  {allowedHyperlinkTypes.includes(LINK_TYPES.ASSET) || type === LINK_TYPES.ASSET ? (
                    <Select.Option value={LINK_TYPES.ASSET}>
                      {t({ id: 'FieldEditors.RichText.HyperlinkDialog.Asset', message: 'Asset' })}
                    </Select.Option>
                  ) : null}
                </Select>
              </FormControl>
            )}
            {type === LINK_TYPES.URI ? (
              <FormControl id="link-uri" isRequired>
                <FormControl.Label>
                  {t({
                    id: 'FieldEditors.RichText.HyperlinkDialog.LinkTarget',
                    message: 'Link target'
                  })}
                </FormControl.Label>
                <TextInput
                  testId="link-target-input"
                  name="link-uri"
                  value={uri || ''}
                  placeholder="https://"
                  onChange={(event) =>
                    setState((currentState) => ({
                      ...currentState,
                      uri: event.target.value
                    }))
                  }
                  // eslint-disable-next-line -- TODO: describe this disable  jsx-a11y/no-autofocus
                  autoFocus={isUriInputAutoFocused}
                />
                <FormControl.HelpText>
                  {t({
                    id: 'FieldEditors.RichText.HyperlinkDialog.ProtocolHelpText',
                    message: 'A protocol may be required, e.g. https://'
                  })}
                </FormControl.HelpText>
              </FormControl>
            ) : (
              renderEntityField()
            )}
          </Form>
        </ModalContent>
        <ModalControls>
          <Button
            type="button"
            onClick={() => onClose(null)}
            variant="secondary"
            testId="cancel-cta"
            size="small"
          >
            {t({ id: 'FieldEditors.RichText.HyperlinkDialog.Cancel', message: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            variant="positive"
            onClick={handleSubmit}
            isDisabled={!isLinkComplete()}
            testId="confirm-cta"
            size="small"
          >
            {resolvedLabels.confirm}
          </Button>
        </ModalControls>
      </>
    </EntityProvider>
  );
}

export const openHyperlinkDialog = (
  dialogs: DialogsAPI,
  { value, showTextInput, allowedHyperlinkTypes, entitySelectorConfigs }: OpenHyperlinkDialogOptions
) => {
  const isNew = !(value.uri || value.target);
  const props = {
    labels: {
      title: isNew
        ? t({
            id: 'FieldEditors.RichText.HyperlinkDialog.InsertHyperlink',
            message: 'Insert hyperlink'
          })
        : t({
            id: 'FieldEditors.RichText.HyperlinkDialog.EditHyperlink',
            message: 'Edit hyperlink'
          }),
      confirm: isNew
        ? t({ id: 'FieldEditors.RichText.HyperlinkDialog.Insert', message: 'Insert' })
        : t({ id: 'FieldEditors.RichText.HyperlinkDialog.Update', message: 'Update' })
    },
    value,
    hideText: !showTextInput,
    allowedHyperlinkTypes,
    entitySelectorConfigs
  };

  return dialogs.openCurrent({
    title: props.labels.title,
    width: 'large',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    allowHeightOverflow: true,
    parameters: {
      type: 'rich-text-hyperlink-dialog',
      ...props
    } as SerializedJSONValue
  });
};
