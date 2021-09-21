import React from 'react';
import PropTypes from 'prop-types';
import { cx } from 'emotion';
import isHotKey from 'is-hotkey';
import styles from './styles';
import { SUPPORTS_NATIVE_SLATE_HYPERLINKS } from '../../helpers/browserSupport';
import { useRequestStatus } from './useRequestStatus';
import { getScheduleTooltipContent } from '@contentful/field-editor-reference';
import { truncate } from './truncate';

import { TextLink, Tooltip } from '@contentful/f36-components';

function isUrl(string) {
  return /^(?:[a-z]+:)?\/\//i.test(string) || /^mailto:/i.test(string);
}

// eslint-disable-next-line react/prop-types
function getEntityInfo({ entityTitle, entityStatus, contentTypeName }) {
  const title = truncate(entityTitle, 60) || 'Untitled';

  return `${contentTypeName || 'Asset'} "${title}", ${entityStatus}`;
}

export default function Hyperlink(props) {
  const { children, node } = props;
  const title = node.data.get('title');
  const uri = node.data.get('uri');
  const href = isUrl(uri) ? uri : 'javascript:void(0)';
  const target = node.data.get('target');
  const requestStatus = useRequestStatus({ richTextAPI: props.richTextAPI, target });

  const getTooltipContent = () => {
    if (requestStatus.type === 'loading') {
      return `Loading ${target.sys.linkType.toLowerCase()}...`;
    }
    let tooltipContent = '';
    if (requestStatus.type === 'error') {
      tooltipContent = `${target.sys.linkType} missing or inaccessible`;
    } else {
      const { jobs, ...entityInfo } = requestStatus.data;
      tooltipContent = `${getEntityInfo(entityInfo)}
    ${jobs.length > 0 ? getScheduleTooltipContent({ job: jobs[0], jobsCount: jobs.length }) : ''}`;
    }
    return tooltipContent;
  };

  const onKeyDown = (e) => {
    if (isHotKey('enter', e)) {
      e.preventDefault();
      e.stopPropagation(); // Ensure Slate doesn't interpret as new paragraph.
      props.onEdit(e);
    }
  };

  const renderLink = ({ tooltipContent }) => {
    return (
      <Tooltip
        content={tooltipContent}
        className={styles.tooltipContainer}
        targetWrapperClassName={styles.hyperlinkWrapper}
        placement="bottom"
        maxWidth="auto">
        {SUPPORTS_NATIVE_SLATE_HYPERLINKS ? (
          <TextLink
            // Allows user to open uri link in new tab.
            href={href}
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
  };

  return (
    <span
      {...props.attributes}
      onClick={props.onEdit}
      onKeyDown={(e) => onKeyDown(e)}
      role="button"
      tabIndex={0}>
      {target
        ? renderLink({ tooltipContent: getTooltipContent() })
        : renderLink({ tooltipContent: uri })}
    </span>
    // TODO: Add contentEditable={false} to tooltip to fix text cursor bug
  );
}

Hyperlink.propTypes = {
  attributes: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  children: PropTypes.node,
  editor: PropTypes.object,
  richTextAPI: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
};
