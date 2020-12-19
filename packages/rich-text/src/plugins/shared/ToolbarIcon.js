import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';

export default class ToolbarIcon extends Component {
  static propTypes = {
    isActive: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string,
  };

  handleClick = (event) => {
    event.preventDefault();
    this.props.onToggle(event);
  };

  render() {
    const { icon, isActive, disabled, title, type } = this.props;

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
}
