/** ******************************************************************
  AUDIO ONLY SCREEN
*********************************************************************/
const React = require('React');
const ControlBar = require('../components/controlBar');
const ClassNames = require('classnames');

const ScrubberBar = require('../components/scrubberBar');

class AudioOnlyScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      controlBarVisible: true,
      animate: false
    };
  }

  render() {
    var titleStyle = {
      color: this.props.skinConfig.startScreen.titleFont.color
    };
    var infoPanelClass = ClassNames({
      'oo-state-screen-audio-title': true,
      'oo-inactive': false,
      'oo-flex-column': true
    });
    var titleClass = ClassNames({
      'oo-state-screen-audio-info': true
    });
    var textStyle = {
      'max-width': '70%'
    };
    var textClass = ClassNames({
      'oo-text-truncate': true
    });
    var titleMetadata = (
      <div style={textStyle} className={textClass}>
        <span className={titleClass} style={titleStyle}>
          {this.props.contentTree.title}
        </span>
        : {this.props.contentTree.description}
      </div>
    );
    return (
      <div className="oo-state-screen-audio oo-flex-column-parent">
        <div className={infoPanelClass}>
          {titleMetadata}
        </div>
        <div className="oo-interactive-container oo-flex-column oo-flex-column-parent">
          <ControlBar
            {...this.props}
            audioOnly={true}
            controlBarVisible={true}
            playerState={this.props.playerState}
            isLiveStream={this.props.isLiveStream}
            a11yControls={this.props.controller.accessibilityControls}
          />
        </div>
        <div className="oo-interactive-container oo-flex-column">
          <div className="oo-scrubber-bar-parent oo-flex-row-parent">
            {this.props.controller.state.audioOnly ? <span className="oo-scrubber-bar-current-time">{this.props.getPlayheadTime()}</span> : null}
            {this.props.controller.state.audioOnly ? <ScrubberBar {...this.props} /> : ''}
            {this.props.controller.state.audioOnly ? <span className="oo-scrubber-bar-duration">{this.props.getTotalTime()}</span> : null}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = AudioOnlyScreen;