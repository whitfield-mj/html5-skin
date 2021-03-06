import React from 'react';
import ClassNames from 'classnames';
import Utils from '../components/utils';
import ControlBar from '../components/controlBar';
import AdOverlay from '../components/adOverlay';
import UpNextPanel from '../components/upNextPanel';
import Spinner from '../components/spinner';
import TextTrackPanel from '../components/textTrackPanel';
import Watermark from '../components/watermark';
import CONSTANTS from '../constants/constants';
import ViewControlsVr from '../components/viewControlsVr';
import Icon from '../components/icon';
import SkipControls from '../components/skipControls';
import UnmuteIcon from '../components/unmuteIcon';
import withAutoHide from './higher-order/withAutoHide';
import CastPanel from '../components/castPanel';
/* eslint-disable react/destructuring-assignment */
/* global document */

/**
 * Represents a screen when a video is playing
 */
class PlayingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.isMobile = this.props.controller.state.isMobile;
    this.browserSupportsTouch = this.props.controller.state.browserSupportsTouch;
    this.skipControlsClientRect = null;
    this.hasCheckedMouseOverControls = false;
    this.mousePosition = { clientX: 0, clientY: 0 };

    this.state = {
      isVrNotificationHidden: false,
      isVrIconHidden: false,
    };
  }

  componentWillMount() {
    this.props.handleVrPlayerMouseUp();
  }

  componentDidMount() {
    if (this.props.controller.videoVr) {
      document.addEventListener('mousemove', this.handlePlayerMouseMove, false);
      document.addEventListener('mouseup', this.handlePlayerMouseUp, false);
      document.addEventListener('touchmove', this.handlePlayerMouseMove, { passive: false });
      document.addEventListener('touchend', this.props.handleTouchEndOnWindow, { passive: false });
      this.handleVrAnimationEnd(this.vrNotificatioContainer, 'isVrNotificationHidden');
      this.handleVrAnimationEnd(this.vrIconContainer, 'isVrIconHidden');
    }
  }

  componentWillUnmount() {
    if (this.props.controller.videoVr) {
      document.removeEventListener('mousemove', this.handlePlayerMouseMove);
      document.removeEventListener('touchmove', this.handlePlayerMouseMove);
      document.removeEventListener('mouseup', this.handlePlayerMouseUp);
      document.removeEventListener('touchend', this.props.handleTouchEndOnWindow);
    }
  }

  /**
   * @description need to show special information labels (or/and icons).
   * The labels should be animated.
   * Need to remove the labels (icons) after animation
   * Animation should be only one time
   * @param {string} ref - unique identificator of the label(icon)
   * @param {string} stateName - name for a state which indicates about necessary to show the label(icon)
   */
  handleVrAnimationEnd = (ref, stateName) => {
    if (!ref) {
      return;
    }
    const animationEndHandler = () => {
      if (stateName) {
        const newState = {};
        newState[stateName] = true;
        this.setState(newState);
      }
      ref.removeEventListener('animationend', animationEndHandler, false);
    };
    ref.addEventListener('animationend', animationEndHandler, false);
  }

  /**
   * The keydown event is not fired when the scrubber bar is first focused with
   * a tab unless playback was activated with a click. As a workaround, we make sure
   * that the controls are shown when a focusable element is focused.
   * @private
   * @param {object} event Focus event object.
   */
  handleFocus = (event) => {
    const isFocusableElement = event.target || event.target.hasAttribute(CONSTANTS.KEYBD_FOCUS_ID_ATTR);
    // Only do this if the control bar hasn't been shown by now and limit to focus
    // events that are triggered on known focusable elements (control bar items and
    // skip buttons). Note that controlBarVisible controls both the control bar and
    // the skip buttons
    if (!this.props.controller.state.controlBarVisible && isFocusableElement) {
      if (typeof this.props.showControlBar === 'function') {
        this.props.showControlBar();
      }

      if (typeof this.props.startHideControlBarTimer === 'function') {
        this.props.startHideControlBarTimer();
      }
      this.props.controller.state.accessibilityControlsEnabled = true;
      this.props.controller.state.isClickedOutside = false;
    }
  }

  /**
   * call handlePlayerMouseDown when mouseDown was called on document and videoType is Vr
   * @param {Event} event - mouse down event object
   */
  handlePlayerMouseDown = (event) => {
    event.preventDefault();
    if (this.props.controller.videoVr) {
      event.persist();
    }
    this.props.handleVrPlayerMouseDown(event);
  }

  /**
   * call handlePlayerMouseMove when mouseMove was called on document and videoType is Vr
   * @param {Event} event - mouse move event object
   */
  handlePlayerMouseMove = (event) => {
    this.storeMousePosition(event);
    this.props.handleVrPlayerMouseMove(event);
  }

  /**
   * it prevents propagetion, changes screens and sets states to support accessibility
   * @param {Event} event - event object
   */
  handlePlayerMouseUp = (event) => {
    // pause or play the video if the skin is clicked on desktop
    if (!this.isMobile) {
      event.stopPropagation(); // W3C
      event.cancelBubble = true; /* IE specific */ // eslint-disable-line
      if (!this.props.controller.videoVr) {
        this.props.controller.togglePlayPause(event); // if clicked on selectableSceen
      }
      // the order of the loop and this.props.controller.state is not important
      this.props.controller.state.accessibilityControlsEnabled = true;
      this.props.controller.state.isClickedOutside = false;
    }

    this.props.handleVrPlayerMouseUp(event);
  }

  /**
   * Handles the mouseover event.
   * @private
   * @param {Event} event The mouseover event object
   */
  handleMouseOver = (event) => {
    this.storeMousePosition(event);
  }

  /**
   * Handles the touchstart event. Note that this handler is for the main element.
   * There's a similar handler for an inner element that handles 360 video interactions.
   * @private
   */
  handleTouchStart = () => {
    // Disable "mouse over controls" check for all touch interactions
    this.hasCheckedMouseOverControls = true;
  }

  /**
   * Extracts and stores the clientX and clientY values from a mouse event. This
   * is used in order to keep track of the last known position. Triggers a check
   * that determines whether the mouse is over the skip controls.
   * @param {Event} event - event object
   */
  storeMousePosition = (event) => {
    if (!event) {
      return;
    }
    this.mousePosition.clientX = event.clientX;
    this.mousePosition.clientY = event.clientY;
    this.tryCheckMouseOverControls();
  }

  /**
   * Called by the SkipControls component when it's done mounting. It informs this
   * component about the position of the SkipControls so that it can determine
   * whether or not the mouse cursor is over the controls.
   * @private
   * @param {DOMRect} clientRect A DOMRect returned by an element's getBoundingClientRect() function
   */
  onSkipControlsMount = (clientRect) => {
    this.skipControlsClientRect = clientRect;
    this.tryCheckMouseOverControls();
  }

  /**
   * Checks to see whether or not the mouse is over the skip controls element and
   * prevents the controls from autohiding if that is the case.
   *
   * IMPORTANT:
   * There's a much simpler way to do this which is just listening to the
   * mouseenter event inside the SkipControls, however, the SkipControls have
   * pointer-events set to 'none' in order to allow clicking through it, so we
   * are unable to listen to any mouse events on said component. This workaround
   * is a bit convoluted but it's needed in order to get a decent user experience.
   * @private
   */
  tryCheckMouseOverControls = () => {
    if (
      this.hasCheckedMouseOverControls
      || !this.skipControlsClientRect
      || !(this.mousePosition.clientX && this.mousePosition.clientY)
    ) {
      return;
    }
    // Cancel auto-hide controls timer if mouse is over controls
    if (
      Utils.isMouseInsideRect(this.mousePosition, this.skipControlsClientRect)
    ) {
      if (typeof this.props.cancelHideControlBarTimer === 'function') {
        this.props.cancelHideControlBarTimer();
      }
    }
    this.hasCheckedMouseOverControls = true;
  }

  /**
   * call handlePlayerClicked when an user clicked on document
   * @param {Event} event - event object
   */
  handlePlayerClicked = (event) => {
    const { isVrMouseMove, controller, handleVrPlayerClick } = this.props;
    if (
      (!isVrMouseMove && !this.isMobile)
      || typeof controller.state.playerParam.onTogglePlayPause === 'function'
    ) {
      controller.togglePlayPause(event);
    }
    handleVrPlayerClick();
  };

  /**
   * call handlePlayerFocus when the player is in focus
   */
  handlePlayerFocus = () => {
    this.props.handleVrPlayerFocus();
  }

  /**
   *
   * @param {number} vrDuration - key for duration in config
   * @param {number} userDefaultDuration - default value for duration
   * @returns {object} empty object or object with animationDuration
   */
  setAnimationDuration = (vrDuration, userDefaultDuration) => {
    let style = {};
    const functionDefaultfDuration = 3; // default value for Duration if userDefaultDuration is undefined
    const defaultDuration = Utils.ensureNumber(userDefaultDuration, functionDefaultfDuration);
    const { animationDurations } = this.props.controller.state.config;
    if (
      animationDurations !== null
      && typeof animationDurations === 'object'
      && typeof animationDurations[vrDuration] !== 'undefined'
    ) {
      const duration = `${Utils.ensureNumber(
        animationDurations[vrDuration],
        defaultDuration
      )}s`;
      style = {
        animationDuration: duration,
        webkitAnimationDuration: duration,
      };
    }
    return style;
  }

  render() {
    const adOverlay = this.props.controller.state.adOverlayUrl
      && this.props.controller.state.showAdOverlay
      ? (
        <AdOverlay
          {...this.props}
          overlay={this.props.controller.state.adOverlayUrl}
          showOverlay={this.props.controller.state.showAdOverlay}
          showOverlayCloseButton={this.props.controller.state.showAdOverlayCloseButton}
        />
      ) : null;

    const upNextPanel = this.props.controller.state.upNextInfo.showing
      && this.props.controller.state.upNextInfo.upNextData
      ? (
        <UpNextPanel
          {...this.props}
          controlBarVisible={this.props.controller.state.controlBarVisible}
          currentPlayhead={this.props.currentPlayhead}
        />
      ) : null;

    const viewControlsVr = this.props.controller.videoVr ? (
      <ViewControlsVr {...this.props} controlBarVisible={this.props.controller.state.controlBarVisible} />
    ) : null;

    const showUnmute = this.props.controller.state.volumeState.mutingForAutoplay
      && this.props.controller.state.volumeState.muted;

    let vrNotification = null;
    if (
      this.props.controller.state.config.isVrAnimationEnabled !== null
      && typeof this.props.controller.state.config.isVrAnimationEnabled === 'object'
      && this.props.controller.state.config.isVrAnimationEnabled.vrNotification
      && this.props.controller.videoVr
      && !this.state.isVrNotificationHidden
      && this.props.controller.isNewVrVideo
    ) {
      // @Todo: When we know about the rules for vrIcon, change checking "if isNewVrVideo"
      const defaultDuration = 5;
      const style = this.setAnimationDuration('vrNotification', defaultDuration);
      vrNotification = (
        <div
          ref={(notification) => { this.vrNotificatioContainer = notification; }}
          className="oo-state-screen-vr-notification-container"
        >
          <p className="oo-state-screen-vr-notification" style={style}>
            {'Select and drag to look around'}
          </p>
        </div>
      );
    }

    let vrIcon = null;
    if (
      this.props.controller.state.config.isVrAnimationEnabled !== null
      && typeof this.props.controller.state.config.isVrAnimationEnabled === 'object'
      && this.props.controller.state.config.isVrAnimationEnabled.vrIcon
      && this.props.controller.videoVr
      && !this.state.isVrIconHidden
      && this.props.controller.isNewVrVideo
    ) {
      const defaultDuration = 3;
      const style = this.setAnimationDuration('vrIcon', defaultDuration);
      vrIcon = (
        <div
          ref={(icon) => { this.vrIconContainer = icon; }}
          className="oo-state-screen-vr-container"
          style={style}
        >
          <div className="oo-state-screen-vr-bg">
            <Icon {...this.props} icon="vrIcon" className="oo-state-screen-vr-icon" />
          </div>
        </div>
      );
    }

    const skipControlsEnabled = Utils.getPropertyValue(
      this.props.skinConfig,
      'skipControls.enabled',
      false
    );
    const isTextTrackInBackground = (
      this.props.controller.state.scrubberBar.isHovering
      || (skipControlsEnabled && this.props.controller.state.controlBarVisible)
    );
    const className = ClassNames('oo-state-screen oo-playing-screen', {
      'oo-controls-active': skipControlsEnabled && this.props.controller.state.controlBarVisible,
      'oo-hide-cursor': !this.props.controller.state.controlBarVisible
        && this.props.controller.state.fullscreen,
    });

    // Always show the poster image on cast session
    const posterImageUrl = this.props.skinConfig.startScreen.showPromo
      ? this.props.contentTree.promo_image
      : '';
    const posterStyle = {};
    if (Utils.isValidString(posterImageUrl)) {
      posterStyle.backgroundImage = `url('${posterImageUrl}')`;
    }

    const stateScreenPosterClass = ClassNames({
      'oo-blur': true,
      'oo-state-screen-poster': this.props.skinConfig.startScreen.promoImageSize !== 'small',
      'oo-state-screen-poster-small': this.props.skinConfig.startScreen.promoImageSize === 'small',
    });

    // Depends of there's another element/panel at the center of the player we will push down
    // the cast panel to allow both elements be visible to the user
    const castPanelClass = ClassNames({
      'oo-info-panel-cast-bottom': skipControlsEnabled,
    });

    // Add a blur only when the content it being casted on a chromecast device and a fading layer
    if (this.props.controller.state.cast.connected) {
      this.props.controller.addBlur();
    } else {
      this.props.controller.removeBlur();
    }

    const fadeUnderlayClass = ClassNames({
      'oo-fading-underlay': true,
      'oo-fading-underlay-active': this.props.controller.state.cast.connected,
      'oo-animate-fade': true,
    });

    const { buffering, isLiveStream } = this.props.controller.state;
    const showSpinner = buffering || (this.props.buffered === 0 && !isLiveStream);

    return (
      <div // eslint-disable-line
        className={className}
        onTouchStart={this.handleTouchStart}
        onMouseOver={this.handleMouseOver}
      >
        {this.props.controller.state.cast.connected
          && <div className={stateScreenPosterClass} style={posterStyle} />}

        {this.props.controller.state.cast.connected && <div className={fadeUnderlayClass} />}

        <div // eslint-disable-line
          className={CONSTANTS.CLASS_NAMES.SELECTABLE_SCREEN}
          onMouseDown={this.handlePlayerMouseDown}
          onTouchStart={this.handlePlayerMouseDown}
          onTouchEnd={this.props.handleTouchEndOnPlayer}
          onClick={this.handlePlayerClicked}
          onFocus={this.handlePlayerFocus}
        />

        {vrNotification}
        {vrIcon}

        <Watermark {...this.props} controlBarVisible={this.props.controller.state.controlBarVisible} />

        {
          this.props.controller.state.cast.connected
          && (
          <CastPanel
            language={this.props.language}
            localizableStrings={this.props.localizableStrings}
            device={this.props.controller.state.cast.device}
            className={castPanelClass}
          />
          )
        }

        {showSpinner && (
          <Spinner loadingImage={this.props.skinConfig.general.loadingImage.imageResource.url} />
        )}

        {viewControlsVr}

        {skipControlsEnabled
          && (
          <SkipControls
            className="oo-absolute-centered"
            config={this.props.controller.state.skipControls}
            language={this.props.language}
            localizableStrings={this.props.localizableStrings}
            responsiveView={this.props.responsiveView}
            skinConfig={this.props.skinConfig}
            controller={this.props.controller}
            currentPlayhead={this.props.currentPlayhead}
            a11yControls={this.props.controller.accessibilityControls}
            isInactive={!this.props.controller.state.controlBarVisible}
            isInBackground={this.props.controller.state.scrubberBar.isHovering}
            onMount={this.onSkipControlsMount}
            onFocus={this.handleFocus}
          />
          )
        }

        <div className="oo-interactive-container" onFocus={this.handleFocus}>
          {this.props.closedCaptionOptions.enabled && (
            <TextTrackPanel
              closedCaptionOptions={this.props.closedCaptionOptions}
              cueText={this.props.closedCaptionOptions.cueText}
              direction={this.props.captionDirection}
              responsiveView={this.props.responsiveView}
              isInBackground={isTextTrackInBackground}
            />
          )}

          {adOverlay}

          {upNextPanel}

          <ControlBar
            {...this.props}
            height={this.props.skinConfig.controlBar.height}
            animatingControlBar
            controlBarVisible={this.props.controller.state.controlBarVisible}
            playerState={this.props.playerState}
            isLiveStream={this.props.isLiveStream}
          />
        </div>

        {showUnmute ? <UnmuteIcon {...this.props} /> : null}
      </div>
    );
  }
}

const PlayingScreenWithAutoHide = withAutoHide(PlayingScreen);

export { PlayingScreen, PlayingScreenWithAutoHide };
