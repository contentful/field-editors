import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuperscript } from '@fortawesome/free-solid-svg-icons';
import { faSubscript } from '@fortawesome/free-solid-svg-icons';
import tokens from '@contentful/forma-36-tokens';
import { css, cx } from 'emotion';

const styles = {
  defaultButton: css({
    background: 'none',
    outline: 'none',
    cursor: 'pointer',
    border: 0,
    margin: '0 1px',
    display: 'inline-block',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background .1s ease-in-out',
    height: '1.875rem',
    width: '1.875rem',
    '&:hover': {
      background: tokens.colorElementLight,
      svg: {
        color: tokens.colorTextDark,
      },
    },
  }),
  activeIcon: css({
    background: tokens.colorElementLight,
  }),
};

export default class ToolbarIcon extends Component {
  static propTypes = {
    /*isActive: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,*/
    onToggle: PropTypes.func.isRequired,
    /* icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string,*/
  };

  handleClick = (event) => {
    event.preventDefault();
    this.props.onToggle(event);
  };

  getEditorIcon = ({ icon, isActive, disabled, title, type }) => {
    const classNames = cx(styles.defaultButton, isActive && styles.activeIcon);
    switch (icon) {
      case 'Superscript':
        return (
          <button
            tooltip={title} // need to think how to implement tooltip for custom buttons -> currently will not work
            label={title}
            disabled={disabled}
            className={classNames}
            data-test-id={`toolbar-toggle-${type}`}
            onClick={this.handleClick}>
            <FontAwesomeIcon icon={faSuperscript} color="#536171" />
          </button>
        );
      case 'Subscript':
        return (
          <button
            tooltip={title} // need to think how to implement tooltip for custom buttons -> currently will not work
            label={title}
            disabled={disabled}
            className={classNames}
            data-test-id={`toolbar-toggle-${type}`}
            onClick={this.handleClick}>
            <FontAwesomeIcon icon={faSubscript} color="#536171" />
          </button>
        );
      default:
        return (
          <EditorToolbarButton
            icon={icon}
            tooltip={title}
            label={title}
            isActive={isActive}
            disabled={disabled}
            data-test-id={`toolbar-toggle-${type}`}
            onClick={this.handleClick}
          />
        );
    }
  };

  render() {
    return <div>{this.getEditorIcon(this.props)}</div>;
  }
}
