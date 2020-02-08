/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import buildWidgetApi from 'app/widgets/WidgetApi/buildWidgetApi';
import RichTextEditor from './RichTextEditor';

export default class ReadOnlyRichTextEditor extends React.Component {
  static propTypes = {
    value: PropTypes.object
  };

  render() {
    const widgetAPI = buildWidgetApi({
      field: this.props.value,
      currentUrl: window.location
    });
    return (
      <RichTextEditor
        {...this.props}
        isToolbarHidden
        actionsDisabled
        readOnly
        widgetAPI={widgetAPI}
        value={this.props.value}
        isDisabled={true}
      />
    );
  }
}
