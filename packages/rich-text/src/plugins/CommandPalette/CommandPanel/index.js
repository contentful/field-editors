import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import isHotKey from 'is-hotkey';
import throttle from 'lodash/throttle';
import flatten from 'lodash/flatten';
import { insertBlock } from '../../EmbeddedEntityBlock/Util';
import { insertInline } from '../../EmbeddedEntryInline/Utils';
import { fetchEntries, fetchAssets, CommandPaletteActionBuilder } from '../CommandPaletteService';
import { removeCommand } from '../Util';
import CommandPanelMenu from './CommandPanelMenu';
import { InViewport } from '@contentful/forma-36-react-components';

const DEFAULT_POSITION = {
  top: 0,
  left: 0,
};
class CommandPalette extends React.PureComponent {
  static propTypes = {
    editor: PropTypes.object,
    command: PropTypes.string,
    richTextAPI: PropTypes.object,
  };

  state = {
    anchorPosition: DEFAULT_POSITION,
    items: [],
    isLoading: true,
    panelPosition: 'bottom',
  };

  paletteDimensions = {
    height: 300,
    width: 300,
  };

  async componentDidMount() {
    this.isComponentMounted = true;
    await this.createInitialCommands();
    this.updatePanelPosition();
    this.paletteDimensions = {
      height: this.palette.getBoundingClientRect().height,
      width: this.palette.getBoundingClientRect().width,
    };
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
    this.removeEventListeners();
    this.requestUpdate.cancel();
  }

  bindEventListeners = () => {
    document.addEventListener('scroll', this.handleScroll, true);
    document.addEventListener('keydown', this.handleKeyboard, true);
    document.addEventListener('click', this.handleOutsideClick, true);
  };

  removeEventListeners = () => {
    document.removeEventListener('scroll', this.handleScroll, true);
    document.removeEventListener('keydown', this.handleKeyboard, true);
    document.removeEventListener('click', this.handleOutsideClick, true);
  };

  handleOutsideClick = (event) => {
    if (!this.palette.contains(event.target)) {
      this.setState({
        isClosed: true,
      });
    }
  };

  requestUpdate = throttle(
    () => {
      if (this.state.currentCommand) {
        this.setState({ isUpdating: true });
        this.createCommands(
          this.state.currentCommand.contentType,
          this.state.currentCommand.type,
          this.props.command
        );
      }
    },
    1000,
    { leading: true, trailing: false }
  );

  componentDidUpdate() {
    if (this.state.currentCommand && this.state.currentCommand.command !== this.props.command) {
      this.requestUpdate();
    } else {
      this.requestUpdate.cancel();
    }
    if (!this.state.isClosed) {
      this.bindEventListeners();
    } else {
      this.removeEventListeners();
    }
  }

  createCommand = (label, contentType, entry, type, description, thumbnail) => ({
    label: `${label}${description ? ` - ${description}` : ''}`,
    thumbnail,
    contentType,
    callback: () => {
      const { editor, command, richTextAPI } = this.props;
      const { logCommandPaletteAction } = richTextAPI;
      removeCommand(editor, command);
      switch (type) {
        case INLINES.EMBEDDED_ENTRY:
          insertInline(editor, entry.sys.id, false);
          logCommandPaletteAction('insert', {
            nodeType: INLINES.EMBEDDED_ENTRY,
          });
          break;
        case BLOCKS.EMBEDDED_ASSET:
          insertBlock(editor, BLOCKS.EMBEDDED_ASSET, entry, false);
          logCommandPaletteAction('insert', {
            nodeType: BLOCKS.EMBEDDED_ASSET,
          });
          break;
        default:
          insertBlock(editor, BLOCKS.EMBEDDED_ENTRY, entry, false);
          logCommandPaletteAction('insert', {
            nodeType: BLOCKS.EMBEDDED_ENTRY,
          });
          break;
      }
    },
  });

  onCreateAndEmbedEntity = async (contentTypeId, nodeType) => {
    const { richTextAPI, editor, command } = this.props;
    const { sdk } = richTextAPI;
    removeCommand(editor, command);
    const { createAsset, createEntry } = sdk.space;
    const isAsset = contentTypeId === null;
    const createEntity = () => (isAsset ? createAsset({}) : createEntry(contentTypeId, {}));
    const entity = await createEntity();
    const { id: entityId, type: entityType } = entity.sys;

    nodeType === INLINES.EMBEDDED_ENTRY
      ? insertInline(editor, entity.sys.id, false)
      : insertBlock(editor, nodeType, entity);

    richTextAPI.logCommandPaletteAction('insert', {
      nodeType,
    });

    const { navigator } = sdk;
    const openEntity = entityType === 'Asset' ? navigator.openAsset : navigator.openEntry;
    return openEntity(entityId, { slideIn: true });
  };

  createContentTypeActions = async (actionBuilder, contentType) => {
    const actions = await Promise.all([
      actionBuilder.maybeBuildEmbedAction(BLOCKS.EMBEDDED_ENTRY, contentType, () => {
        this.setState({ breadcrumb: contentType.name, isLoading: true });
        this.createCommands(contentType);
        this.clearCommand();
      }),
      actionBuilder.maybeBuildEmbedAction(INLINES.EMBEDDED_ENTRY, contentType, () => {
        this.setState({ breadcrumb: contentType.name, isLoading: true });
        this.createCommands(contentType, INLINES.EMBEDDED_ENTRY);
        this.clearCommand();
      }),
      actionBuilder.maybeBuildCreateAndEmbedAction(BLOCKS.EMBEDDED_ENTRY, contentType, () =>
        this.onCreateAndEmbedEntity(contentType.sys.id, BLOCKS.EMBEDDED_ENTRY)
      ),
      actionBuilder.maybeBuildCreateAndEmbedAction(INLINES.EMBEDDED_ENTRY, contentType, () =>
        this.onCreateAndEmbedEntity(contentType.sys.id, INLINES.EMBEDDED_ENTRY)
      ),
    ]);
    return actions.filter((action) => action);
  };

  createAssetActions = async (actionBuilder) => {
    const actions = await Promise.all([
      actionBuilder.maybeBuildEmbedAction(BLOCKS.EMBEDDED_ASSET, null, () => {
        this.setState({ breadcrumb: 'Asset', isLoading: true });
        this.createCommands(null, BLOCKS.EMBEDDED_ASSET);
        this.clearCommand();
      }),
      actionBuilder.maybeBuildCreateAndEmbedAction(BLOCKS.EMBEDDED_ASSET, null, () =>
        this.onCreateAndEmbedEntity(null, BLOCKS.EMBEDDED_ASSET)
      ),
    ]);
    return actions.filter((action) => action);
  };

  handleScroll = (e) => {
    if (e.target.nodeName !== 'UL') {
      this.updatePanelPosition();
    }
  };

  clearCommand = () => {
    if (this.props.command !== '/') {
      removeCommand(this.props.editor, this.props.command, 0);
    }
  };

  createCommands = async (contentType, type, command) => {
    this.setState({ isUpdating: true });
    const allEntries = !contentType
      ? await fetchAssets(this.props.richTextAPI.sdk, command)
      : await fetchEntries(this.props.richTextAPI.sdk, contentType, command);

    if (this.isComponentMounted) {
      this.setState({
        currentCommand: {
          contentType,
          type,
          command,
        },
        isUpdating: false,
        isLoading: false,
        items: allEntries.map((entry) =>
          this.createCommand(
            entry.displayTitle,
            entry.contentTypeName,
            entry.entry,
            type,
            entry.description,
            entry.thumbnail
          )
        ),
      });
    }
  };

  createInitialCommands = async () => {
    const { sdk } = this.props.richTextAPI;

    const allContentTypes = sdk.space.getCachedContentTypes();

    this.setState({
      isLoading: false,
    });

    const actionBuilder = new CommandPaletteActionBuilder(sdk);

    const contentTypeActions = flatten(
      await Promise.all(
        allContentTypes.map((ct) => this.createContentTypeActions(actionBuilder, ct))
      )
    );

    const assetActions = await this.createAssetActions(actionBuilder);

    this.setState((prevState) => ({
      items: [...prevState.items, ...contentTypeActions, ...assetActions],
    }));
  };

  handleKeyboard = (e) => {
    const isEscKey = isHotKey('esc', e); // ESC to close menu shouldn't blur editor.
    if (isEscKey || isHotKey('down', e) || isHotKey('up', e) || isHotKey('enter', e)) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isEscKey || isHotKey('tab', e)) {
      this.setState({
        isClosed: true,
      });
    }
  };

  render() {
    // Todo: Revisit tab index.
    /* eslint-disable jsx-a11y/no-noninteractive-tabindex */
    /* eslint-disable jsx-a11y/tabindex-no-positive */
    if (this.state.isClosed) {
      return null;
    }
    const root = window.document.body;
    return ReactDOM.createPortal(
      <div
        tabIndex="1"
        ref={(ref) => {
          this.palette = ref;
        }}
        style={{
          position: 'absolute',
          outline: 'none',
          minWidth: 200,
          top: this.state.anchorPosition.top,
          left: this.state.anchorPosition.left,
        }}>
        <InViewport
          onOverflowBottom={() => {
            if (this.state.panelPosition !== 'top') {
              this.setState({ panelPosition: 'top' }, this.updatePanelPosition);
            }
          }}
          onOverflowTop={() => {
            if (this.state.panelPosition !== 'bottom') {
              this.setState({ panelPosition: 'bottom' }, this.updatePanelPosition);
            }
          }}>
          <CommandPanelMenu
            searchString={this.props.command === '/' ? '' : this.props.command}
            items={this.state.items}
            isLoading={this.state.isLoading}
            isUpdating={this.state.isUpdating}
            onClose={() => {
              this.setState({
                isClosed: true,
              });
            }}
            breadcrumb={this.state.breadcrumb}
            richTextAPI={this.props.richTextAPI}
          />
        </InViewport>
      </div>,
      root
    );
  }

  updatePanelPosition() {
    const anchorRect = document.getSelection().getRangeAt(0).getBoundingClientRect();

    this.setState((prevState) => ({
      anchorPosition: {
        top:
          prevState.panelPosition === 'bottom'
            ? anchorRect.bottom
            : anchorRect.top - this.paletteDimensions.height,
        left: anchorRect.left,
      },
    }));
  }
}

export default CommandPalette;
