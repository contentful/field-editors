import React from 'react';
import { Tooltip, TextLink } from '@contentful/forma-36-react-components';
import PropTypes from 'prop-types';
import { INLINES } from '@contentful/rich-text-types';
import { SUPPORTS_NATIVE_SLATE_HYPERLINKS } from '../../helpers/browserSupport';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const { HYPERLINK, ENTRY_HYPERLINK, ASSET_HYPERLINK } = INLINES;

const ICON_MAP = {
  [HYPERLINK]: 'ExternalLink',
  [ENTRY_HYPERLINK]: 'Entry',
  [ASSET_HYPERLINK]: 'Asset'
};

const styles = {
  richTextEntityTooltipContentContentType: css({
    color: tokens.colorTextLightest,
    marginRight: tokens.spacingXs,
    '&:after': {
      content: '""'
    }
  }),
  richTextEntityTooltipContentTitle: css({
    marginRight: tokens.spacingXs
  })
};

export default class Hyperlink extends React.Component {
  static propTypes = {
    attributes: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    children: PropTypes.node,
    editor: PropTypes.object,
    createHyperlinkDialog: PropTypes.func,
    onClick: PropTypes.func,
    onEntityFetchComplete: PropTypes.func,
    renderEntityHyperlinkTooltip: PropTypes.func
  };

  static defaultProps = {
    renderEntityHyperlinkTooltip: (target) => <div>{target.sys.linkType} <code>{target.sys.id}</code></div>
  };

  render() {
    const { node } = this.props;
    const uri = node.data.get('uri');
    const target = node.data.get('target');
    // TODO: Use icon once we implement nicer cursor interaction with link.
    const _icon = ICON_MAP[node.type];

    return (
      <span {...this.props.attributes} onClick={this.props.onClick}>
        {target ? this.renderEntityLink(target) : this.renderLink({ tooltip: uri })}
      </span>
      // TODO: Add contentEditable={false} to tooltip to fix text cursor bug
    );
  }

  renderLink({ tooltip }) {
    const { children, node } = this.props;
    const title = node.data.get('title');
    const uri = node.data.get('uri');
    const href = isUrl(uri) ? uri : 'javascript:void(0)';
    return (
      <Tooltip
        content={tooltip}
        className="rich-text__tooltip-container"
        targetWrapperClassName="rich-text__hyperlink-wrapper"
        maxWidth="auto">
        {SUPPORTS_NATIVE_SLATE_HYPERLINKS ? (
          <TextLink
            href={href} // Allows user to open uri link in new tab.
            rel="noopener noreferrer"
            title={title}
            className="rich-text__hyperlink">
            {children}
          </TextLink>
        ) : (
          <span className="rich-text__hyperlink rich-text__hyperlink--ie-fallback">{children}</span>
        )}
      </Tooltip>
    );
  }

  renderEntityLink(target) {
    const tooltip = this.props.renderEntityHyperlinkTooltip(target);
    return this.renderLink({ tooltip });
  }
}

function isUrl(string) {
  return /^(?:[a-z]+:)?\/\//i.test(string) || /^mailto:/i.test(string);
}
