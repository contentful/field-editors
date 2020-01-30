import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropdownListItem } from '@contentful/forma-36-react-components';

export default class ToolbarDropdownListItem extends Component {
  static propTypes = {
    isActive: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string,
    children: PropTypes.node
  };

  handleMouseDown = event => {
    /*
      We're using the mousedown event rather than onclick because onclick will
      steal the focus.
    */

    event.preventDefault();
    this.props.onToggle(event);
  };

  render() {
    const { isActive, title, type, children } = this.props;
    return (
      <DropdownListItem
        label={title}
        isActive={isActive}
        data-test-id={`toolbar-toggle-${type}`}
        className={`toolbar-toggle-${type}`}
        onMouseDown={this.handleMouseDown}>
        {children}
      </DropdownListItem>
    );
  }
}
