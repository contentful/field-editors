import React from 'react';
import { Tooltip, TextLink } from '@contentful/forma-36-react-components';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { truncate } from 'utils/StringUtils';
import { INLINES } from '@contentful/rich-text-types';
import { default as FetchEntity, RequestStatus } from 'app/widgets/shared/FetchEntity';
import WidgetAPIContext from 'app/widgets/WidgetApi/WidgetApiContext';
import { isIE, isEdge } from 'utils/browser';
import { EntityStatusTag } from 'components/shared/EntityStatusTag';
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
    getTooltipData: PropTypes.func
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
        {hasRealHyperlinkInSlateSupport() ? (
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

  renderEntityTooltipContent = (contentTypeName, title, entityStatus) => {
    const { getTooltipData } = this.props;
    let additionalContent = null;
    if (getTooltipData) {
      additionalContent = getTooltipData('Entry');
    }
    return (
      <>
        <div>
          <span className={styles.richTextEntityTooltipContentContentType}>{contentTypeName}</span>
          <span className={styles.richTextEntityTooltipContentTitle}>{title}</span>
          <EntityStatusTag statusLabel={entityStatus} />
        </div>
        {additionalContent || null}
      </>
    );
  };

  renderEntityLink(target) {
    const { onEntityFetchComplete } = this.props;
    return (
      <WidgetAPIContext.Consumer>
        {({ widgetAPI }) => (
          <FetchEntity
            widgetAPI={widgetAPI}
            entityId={target.sys.id}
            entityType={target.sys.linkType}
            localeCode={widgetAPI.field.locale}
            render={({ requestStatus, entityTitle, entityStatus, contentTypeName = 'Asset' }) => {
              if (requestStatus === RequestStatus.Pending) {
                return this.renderLink({
                  tooltip: `Loading ${target.sys.linkType.toLowerCase()}...`
                });
              }

              onEntityFetchComplete && onEntityFetchComplete();
              let tooltip = '';
              if (requestStatus === RequestStatus.Error) {
                tooltip = `${target.sys.linkType} missing or inaccessible`;
              } else if (requestStatus === RequestStatus.Success) {
                const title = truncate(entityTitle, 60) || 'Untitled';
                tooltip = this.renderEntityTooltipContent(contentTypeName, title, entityStatus);
              }
              return this.renderLink({ tooltip });
            }}
          />
        )}
      </WidgetAPIContext.Consumer>
    );
  }
}

function isUrl(string) {
  return /^(?:[a-z]+:)?\/\//i.test(string) || /^mailto:/i.test(string);
}

function hasRealHyperlinkInSlateSupport() {
  // The <a/> element as an inline node causes buggy behavior in IE11/Edge.
  return !isIE() && !isEdge();
}
