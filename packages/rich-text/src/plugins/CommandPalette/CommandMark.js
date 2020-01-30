import React from 'react';
import PropTypes from 'prop-types';

class CommandMark extends React.PureComponent {
  static propTypes = {
    editor: PropTypes.object,
    attributes: PropTypes.object
  };

  render() {
    const { children, attributes } = this.props;
    return (
      <span tabIndex="1" {...attributes} className="command-context">
        {children}
      </span>
    );
  }
}

export default CommandMark;
