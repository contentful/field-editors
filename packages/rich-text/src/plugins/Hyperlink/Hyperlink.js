import React from 'react';
import { Tooltip, TextLink } from '@contentful/forma-36-react-components';
import PropTypes from 'prop-types';
import { cx } from 'emotion';
import noop from 'lodash/noop';
import isHotKey from 'is-hotkey';
import styles from './styles';
import { SUPPORTS_NATIVE_SLATE_HYPERLINKS } from '../../helpers/browserSupport';

export default class Hyperlink extends React.Component {
  static propTypes = {
    attributes: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    children: PropTypes.node,
    editor: PropTypes.object,
    createHyperlinkDialog: PropTypes.func,
    onEdit: PropTypes.func,
    renderEntityHyperlinkTooltip: PropTypes.func
  };

  static defaultProps = {
    onEdit: noop,
    renderEntityHyperlinkTooltip: target => (
      <div>
        {target.sys.linkType} <code>{target.sys.id}</code>
      </div>
    )
  };

  onKeyDown(e) {
    if (isHotKey('enter', e)) {
      e.preventDefault();
      e.stopPropagation(); // Ensure Slate doesn't interpret as new paragraph.
      this.props.onEdit(e);
    }
  }

  render() {
    const { node } = this.props;
    const uri = node.data.get('uri');
    const target = node.data.get('target');

    return (
      <span {...this.props.attributes} onClick={this.props.onEdit} onKeyDown={e => this.onKeyDown(e)} role="button" tabIndex={0}>
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

  renderEntityLink(target) {
    const tooltip = this.props.renderEntityHyperlinkTooltip(target);
    return this.renderLink({ tooltip });
  }
}

function isUrl(string) {
  return /^(?:[a-z]+:)?\/\//i.test(string) || /^mailto:/i.test(string);
}
