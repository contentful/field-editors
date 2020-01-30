/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import buildWidgetApi from 'app/widgets/WidgetApi/buildWidgetApi';
import WidgetAPIContext from 'app/widgets/WidgetApi/WidgetApiContext';
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
      <WidgetAPIContext.Provider value={{ widgetAPI }}>
        <RichTextEditor
          {...this.props}
          isToolbarHidden
          actionsDisabled
          readOnly
          widgetAPI={widgetAPI}
          value={this.props.value}
          isDisabled={true}
        />
      </WidgetAPIContext.Provider>
    );
  }
}
