import React from 'react';
import PropTypes from 'prop-types';
import { isEmbeddingEnabled } from './CommandPaletteService';
import { hasCommandPaletteDecoration, getCommandText } from './Util';
import CommandPanel from './CommandPanel';
class CommandPalette extends React.PureComponent {
  static propTypes = {
    editor: PropTypes.object,
    richTextAPI: PropTypes.object,
    onClose: PropTypes.func
  };

  state = {
    embedsEnabled: false
  };

  componentDidCatch(error, info) {
    // TODO:xxx Find another way to log this or get rid of it. Seems nothing is in Bugsnag right now anyhow.
    // logger.logError('Unexpected rich text commands error.', { error, info });
  }

  async UNSAFE_componentDidMount() {
    const { field } = this.props.richTextAPI.widgetAPI;
    this.setState({
      embedsEnabled: isEmbeddingEnabled(field)
    });
  }

  render() {
    if (!hasCommandPaletteDecoration(this.props.editor) || !this.state.embedsEnabled) {
      return null;
    }

    return (
      <CommandPanel
        editor={this.props.editor}
        richTextAPI={this.props.richTextAPI}
        command={getCommandText(this.props.editor)}
      />
    );
  }
}

export default CommandPalette;
