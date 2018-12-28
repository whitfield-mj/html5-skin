/** ******************************************************************
  END SCREEN
*********************************************************************/
let React = require('react');

let ReactDOM = require('react-dom');

let ClassNames = require('classnames');

let CONSTANTS = require('../constants/constants');

let ControlBar = require('../components/controlBar');

let Watermark = require('../components/watermark');

let Icon = require('../components/icon');

let ResizeMixin = require('../mixins/resizeMixin');

let Utils = require('../components/utils');
let createReactClass = require('create-react-class');

const CastPanel = require('../components/castPanel');

let EndScreen = createReactClass({
  mixins: [ResizeMixin],

  getInitialState: function() {
    return {
      controlBarVisible: true,
      descriptionText: this.props.contentTree.description,
    };
  },

  componentDidMount: function() {
    this.handleResize();
  },

  handleResize: function() {
    if (ReactDOM.findDOMNode(this.refs.description)) {
      this.setState({
        descriptionText: Utils.truncateTextToWidth(
          ReactDOM.findDOMNode(this.refs.description),
          this.props.contentTree.description
        ),
      });
    }
  },

  handleClick: function(event) {
    // pause or play the video if the skin is clicked
    event.preventDefault();
    this.props.controller.state.accessibilityControlsEnabled = true;
    this.props.controller.togglePlayPause();
  },

  render: function() {
    let actionIconStyle = {
      color: this.props.skinConfig.endScreen.replayIconStyle.color,
      opacity: this.props.skinConfig.endScreen.replayIconStyle.opacity,
    };

    if (this.props.controller.state.cast.connected) {
      actionIconStyle['fontSize'] = '125px';
    }

    let titleStyle = {
      color: this.props.skinConfig.startScreen.titleFont.color,
    };
    let descriptionStyle = {
      color: this.props.skinConfig.startScreen.descriptionFont.color,
    };

    let actionIconClass = ClassNames({
      'oo-action-icon': true,
      'oo-hidden': !this.props.skinConfig.endScreen.showReplayButton,
    });

    let infoPanelPosition = Utils.getPropertyValue(this.props.skinConfig, 'endScreen.infoPanelPosition');

    if (infoPanelPosition) {
      var infoPanelClass = ClassNames({
        'oo-state-screen-info': true,
        'oo-info-panel-top': infoPanelPosition.toLowerCase().indexOf('top') > -1,
        'oo-info-panel-bottom': infoPanelPosition.toLowerCase().indexOf('bottom') > -1,
        'oo-info-panel-left': infoPanelPosition.toLowerCase().indexOf('left') > -1,
        'oo-info-panel-right': infoPanelPosition.toLowerCase().indexOf('right') > -1,
      });
      var titleClass = ClassNames({
        'oo-state-screen-title': true,
        'oo-text-truncate': true,
        'oo-pull-right': infoPanelPosition.toLowerCase().indexOf('right') > -1,
        'oo-hidden': !Utils.getPropertyValue(this.props.skinConfig, 'endScreen.showTitle'),
      });
      var descriptionClass = ClassNames({
        'oo-state-screen-description': true,
        'oo-pull-right': infoPanelPosition.toLowerCase().indexOf('right') > -1,
        'oo-hidden': !Utils.getPropertyValue(this.props.skinConfig, 'endScreen.showDescription'),
      });
    }

    // Shows the information of the chromecast device just below the replay icon
    const castPanelClass = ClassNames({
      'oo-info-panel-cast-bottom': true,
    });

    let titleMetadata = (
      <div className={titleClass} style={titleStyle}>
        {this.props.contentTree.title}
      </div>
    );
    let descriptionMetadata = (
      <div className={descriptionClass} ref="description" style={descriptionStyle}>
        {this.state.descriptionText}
      </div>
    );

    return (
      <div className="oo-state-screen oo-end-screen">
        <div className="oo-underlay-gradient" />

        <a className="oo-state-screen-selectable" onClick={this.handleClick} />

        <Watermark {...this.props} controlBarVisible={this.state.controlBarVisible} />

        <div className={infoPanelClass}>
          {titleMetadata}
          {descriptionMetadata}
        </div>

        <button
          type="button"
          className={actionIconClass}
          onClick={this.handleClick}
          onMouseUp={Utils.blurOnMouseUp}
          tabIndex="0"
          aria-label={CONSTANTS.ARIA_LABELS.REPLAY}
        >
          <Icon {...this.props} icon="replay" style={actionIconStyle} />
        </button>

        {
          this.props.controller.state.cast.connected &&
          <CastPanel
            language={this.props.language}
            localizableStrings={this.props.localizableStrings}
            device={this.props.controller.state.cast.device}
            className={castPanelClass}
          />
        }

        <div className="oo-interactive-container">
          <ControlBar
            {...this.props}
            height={this.props.skinConfig.controlBar.height}
            animatingControlBar={true}
            controlBarVisible={this.state.controlBarVisible}
            playerState={this.props.playerState}
            isLiveStream={this.props.isLiveStream}
          />
        </div>
      </div>
    );
  },
});
module.exports = EndScreen;
