import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  TextField,
  Button,
  Form,
  FormLabel,
  TextLink,
  SelectField,
  Option
} from '@contentful/forma-36-react-components';

export const LINK_TYPES = {
  URI: 'uri',
  ENTRY: 'Entry',
  ASSET: 'Asset'
};

function isFeaturingEntitySelector(entitySelectorConfigs = {}) {
  return !!entitySelectorConfigs.Entry || !!entitySelectorConfigs.Asset;
}

function entityToLink(entity) {
  const { id, type } = entity.sys;
  return { sys: { id, type: 'Link', linkType: type } };
}

export class HyperlinkDialog extends React.Component {
  static propTypes = {
    labels: PropTypes.shape({
      title: PropTypes.string,
      confirm: PropTypes.string
    }),
    value: PropTypes.shape({
      text: PropTypes.string,
      uri: PropTypes.string,
      target: PropTypes.object,
      // Will be overwritten accordingly if `uri` or `target.sys.linkType` are set.
      type: PropTypes.oneOf(['uri', 'Entry', 'Asset'])
    }),
    entitySelectorConfigs: PropTypes.object,
    allowedHyperlinkTypes: PropTypes.arrayOf(
      PropTypes.oneOf([LINK_TYPES.ENTRY, LINK_TYPES.ASSET, LINK_TYPES.URI])
    ),
    hideText: PropTypes.bool,
    onClose: PropTypes.func.isRequired
  };

  static defaultProps = {
    labels: {
      title: 'Insert link',
      confirm: 'Insert link'
    },
    value: {},
    hideText: false,
    entitySelectorConfigs: {},
    allowedHyperlinkTypes: [LINK_TYPES.ENTRY, LINK_TYPES.ASSET, LINK_TYPES.URI]
  };

  constructor(props) {
    super(props);

    const { text, type, uri, target } = props.value;
    const isEntityLink = Boolean(target);
    const entityLinks = {
      [LINK_TYPES.ENTRY]: null,
      [LINK_TYPES.ASSET]: null
    };
    let linkType = type;

    if (isEntityLink) {
      linkType = target.sys.linkType;
      entityLinks[linkType] = target;
    } else if (props.allowedHyperlinkTypes.includes(LINK_TYPES.URI)) {
      linkType = LINK_TYPES.URI;
    } else {
      linkType = props.allowedHyperlinkTypes[0];
    }

    this.state = { text, uri, entityLinks, type: linkType };
  }

  setTargetEntity(type, entity) {
    this.setState(state => ({
      entityLinks: {
        ...state.entityLinks,
        [type]: entity ? entityToLink(entity) : undefined
      }
    }));
  }

  getValue() {
    const { text, type, uri } = this.state;
    const value = { type };
    if (text) {
      value.text = text;
    }
    if (type === LINK_TYPES.URI) {
      value.uri = uri;
    } else {
      value.target = this.state.entityLinks[type];
    }
    return value;
  }

  isLinkComplete() {
    const { text, type, uri, target } = this.getValue();
    const requiresText = !this.props.hideText;
    if (requiresText && !text) {
      return false;
    }
    return (type === LINK_TYPES.URI && uri) || target;
  }

  handleSubmit = event => {
    event.preventDefault();
    this.props.onClose(this.getValue());
  };

  render() {
    const { labels } = this.props;
    return (
      <React.Fragment>
        <Modal.Content>{this.renderFields()}</Modal.Content>
        <Modal.Controls>
          <Button
            type="submit"
            buttonType="positive"
            onClick={this.handleSubmit}
            disabled={!this.isLinkComplete()}
            testId="confirm-cta">
            {labels.confirm}
          </Button>
          <Button
            type="button"
            onClick={() => this.props.onClose(null)}
            buttonType="muted"
            testId="cancel-cta">
            Cancel
          </Button>
        </Modal.Controls>
      </React.Fragment>
    );
  }

  renderFields() {
    const { hideText, allowedHyperlinkTypes, entitySelectorConfigs } = this.props;
    const { uri, text, type } = this.state;

    return (
      <Form>
        {hideText ? null : (
          <TextField
            required
            labelText="Link text"
            value={text || ''}
            onChange={e => this.setState({ text: e.target.value })}
            id="link-text"
            name="link-text"
            textInputProps={{
              testId: 'link-text-input'
            }}
          />
        )}
        {isFeaturingEntitySelector(entitySelectorConfigs) && (
          <SelectField
            labelText="Link type"
            value={type}
            onChange={e => this.setState({ type: e.target.value })}
            name="link-type"
            id="link-type"
            selectProps={{ testId: 'link-type-select' }}>
            {/* Show the option if the link type is allowed or the current link is of type that is no longer valid */}
            {allowedHyperlinkTypes.includes(LINK_TYPES.URI) || type === LINK_TYPES.URI ? (
              <Option value={LINK_TYPES.URI}>URL</Option>
            ) : null}
            {allowedHyperlinkTypes.includes(LINK_TYPES.ENTRY) || type === LINK_TYPES.ENTRY ? (
              <Option value={LINK_TYPES.ENTRY}>Entry</Option>
            ) : null}
            {allowedHyperlinkTypes.includes(LINK_TYPES.ASSET) || type === LINK_TYPES.ASSET ? (
              <Option value={LINK_TYPES.ASSET}>Asset</Option>
            ) : null}
          </SelectField>
        )}
        {type === LINK_TYPES.URI ? (
          <TextField
            required
            labelText="Link target"
            value={uri || ''}
            textInputProps={{
              placeholder: 'https://',
              testId: 'link-uri-input',
              autoFocus: true
            }}
            helpText="A protocol may be required, e.g. https://"
            onChange={e => this.setState({ uri: e.target.value })}
            id="link-uri"
            name="link-uri"
          />
        ) : (
          this.renderEntityField()
        )}
      </Form>
    );
  }

  renderEntityField() {
    const { type, entityLinks } = this.state;
    const resetEntity = () => this.setTargetEntity(type, null);
    const entityLink = entityLinks[type];
    const isEntitySelectorVisible = !entityLink;
    return (
      <div>
        <FormLabel required htmlFor="">
          Link target
        </FormLabel>
        {!isEntitySelectorVisible && (
          <TextLink className="entity-selector-dialog__change-selection-link" onClick={resetEntity}>
            Change selection
          </TextLink>
        )}
        {entityLink && (
          <div>
            <div>entity card</div>
            {/* <FetchedEntityCard
              className="entity-selector-dialog__asset-card"
              entityId={entityLink.sys.id}
              entityType={entityLink.sys.linkType}
              readOnly={true}
              disabled={false}
              selected={false}
            /> */}
          </div>
        )}
        {/* Keep all entity selectors in the DOM for super fast types switching ux.*/}
        {this.renderEntitySelector(LINK_TYPES.ENTRY, isEntitySelectorVisible)}
        {this.renderEntitySelector(LINK_TYPES.ASSET, isEntitySelectorVisible)}
      </div>
    );
  }

  renderEntitySelector(type, isVisible) {
    if (isVisible) {
      return <div>Not implemented</div>;
    }

    return null;
  }
}

export const openHyperlinkDialog = (dialogs, { value, showTextInput, allowedHyperlinkTypes }) => {
  const isNew = !(value.uri || value.target);
  const props = {
    labels: {
      title: isNew ? 'Insert hyperlink' : 'Edit hyperlink',
      confirm: isNew ? 'Insert' : 'Update'
    },
    value,
    hideText: !showTextInput,
    allowedHyperlinkTypes
  };

  console.log(props);

  return dialogs.openExtension({
    title: props.labels.title,
    width: 'large',
    minHeight: '290px',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: 'rich-text-hyperlink-dialog',
      ...props
    }
  });
};
