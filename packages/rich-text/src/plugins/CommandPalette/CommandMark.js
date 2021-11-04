import React from 'react';
import PropTypes from 'prop-types';

class CommandMark extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    editor: PropTypes.object,
    attributes: PropTypes.object,
  };

  render() {
    // Todo: Revisit tab index.
    /* eslint-disable jsx-a11y/no-noninteractive-tabindex */
    /* eslint-disable jsx-a11y/tabindex-no-positive */
    const { children, attributes } = this.props;
    return (
      <span tabIndex="1" {...attributes} className="command-context">
        {children}
      </span>
    );
  }
}

export default CommandMark;
