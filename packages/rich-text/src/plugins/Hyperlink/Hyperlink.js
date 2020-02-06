import React from 'react';
import { Tooltip, TextLink } from '@contentful/forma-36-react-components';
import PropTypes from 'prop-types';
import { INLINES } from '@contentful/rich-text-types';
import { SUPPORTS_NATIVE_SLATE_HYPERLINKS } from '../../helpers/browserSupport';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const { HYPERLINK, ENTRY_HYPERLINK, ASSET_HYPERLINK } = INLINES;

const ICON_MAP = {
  [HYPERLINK]: 'ExternalLink',
  [ENTRY_HYPERLINK]: 'Entry',
  [ASSET_HYPERLINK]: 'Asset'
};

const styles = {
  tooltipContentContentType: css({
    color: tokens.colorTextLightest,
    marginRight: tokens.spacingXs,
    '&:after': {
      content: ':'
    }
  }),
  tooltipContentTitle: css({
    marginRight: tokens.spacingXs
  }),
  tooltipContainer: css({
    display: 'inline',
    position: 'relative'
  }),
  hyperlinkWrapper: css({
    display: 'inline',
    position: 'static',
    a: {
      'font-size': 'inherit'
    }
  }),
  hyperlink: css({
    display: 'inline !important',
    '&:hover': {
      fill: tokens.textColorDark
    },
    '&:focus': {
      fill: tokens.textColorDark
    }
  }),
  hyperlinkIEFallback: css({
    color: '#1683d0',
    'text-decoration': 'underline'
  }),
  // TODO: use these styles once we have the icon
  hyperlinkIcon: css({
    position: 'relative',
    top: '4px',
    height: '14px',
    margin: '0 -2px 0 -1px',
    '-webkit-transition': 'fill 100ms ease-in-out',
    transition: 'fill 100ms ease-in-out',
    '&:hover': {
      fill: tokens.textColorDark
    },
    '&:focus': {
      fill: tokens.textColorDark
    }
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
    renderEntityHyperlinkTooltip: target => (
      <div>
        {target.sys.linkType} <code>{target.sys.id}</code>
      </div>
    )
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
        className={styles.tooltipContainer}
        targetWrapperClassName={styles.hyperlinkWrapper}
        maxWidth="auto">
        {SUPPORTS_NATIVE_SLATE_HYPERLINKS ? (
          <TextLink
            href={href} // Allows user to open uri link in new tab.
            rel="noopener noreferrer"
            title={title}
            className={styles.hyperlink}>
            {children}
          </TextLink>
        ) : (
          <span className={cx(styles.hyperlink, styles.hyperlinkIEFallback)}>{children}</span>
        )}
      </Tooltip>
    );
  }

  renderEntityTooltipContent = (contentTypeName, title, entityStatus) => {
    const { getTooltipData } = this.props;
    let additionalContent = null;
    if (getTooltipData) {
      additionalContent = getTooltipData('Entry');
    }
    return (
      <>
        <div>
          <span className={styles.tooltipContentContentType}>{contentTypeName}</span>
          <span className={styles.tooltipContentTitle}>{title}</span>
          // TODO:xxx
          {/*<EntityStatusTag statusLabel={entityStatus} />*/}
        </div>
        {additionalContent || null}
      </>
    );
  };

  renderEntityLink(target) {
    const tooltip = this.props.renderEntityHyperlinkTooltip(target);
    return this.renderLink({ tooltip });
  }
}

function isUrl(string) {
  return /^(?:[a-z]+:)?\/\//i.test(string) || /^mailto:/i.test(string);
}
