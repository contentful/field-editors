import PropTypes from 'prop-types';

export const MarkPropTypes = {
  attributes: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  mark: PropTypes.string.isRequired
};

export const NodePropTypes = {
  attributes: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  node: PropTypes.shape({
    type: PropTypes.string.isRequired
  }).isRequired
};
