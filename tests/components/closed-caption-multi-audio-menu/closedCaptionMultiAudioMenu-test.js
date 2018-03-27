jest.dontMock('../../../js/components/closed-caption-multi-audio-menu/closedCaptionMultiAudioMenu');
jest.dontMock('../../../js/components/closed-caption-multi-audio-menu/multiAudioTab');
jest.dontMock('../../../js/components/closed-caption-multi-audio-menu/tab');
jest.dontMock('../../../js/components/closed-caption-multi-audio-menu/helpers');
jest.dontMock('../../../js/constants/constants');
jest.dontMock('underscore');
jest.dontMock('iso-639-3');

var _ = require('underscore');
var React = require('react');
var TestUtils = require('react-addons-test-utils');
var iso639 = require('iso-639-3');
var sinon = require('sinon');

var CONSTANTS = require('../../../js/constants/constants');
var helpers = require('../../../js/components/closed-caption-multi-audio-menu/helpers');

var ClosedCaptionMultiAudioMenu = require(
  '../../../js/components/closed-caption-multi-audio-menu/closedCaptionMultiAudioMenu'
);
var MultiAudioTab = require('../../../js/components/closed-caption-multi-audio-menu/multiAudioTab');
var Tab = require('../../../js/components/closed-caption-multi-audio-menu/tab');

describe('ClosedCaptionMultiAudioMenu component', function() {
  var selectedAudioId = null,
      selectedCaptionsId = null,
      currentAudioId,
      props = {},
      DOM;

  beforeEach(function() {
    props = {
      menuClassName: undefined,
      skinConfig: {},
      controller: {
        setCurrentAudio: function(id) {
          selectedAudioId = id;
        },
        onClosedCaptionChange: function(id) {
          selectedCaptionsId = id;
        },
        state: {
          closedCaptionOptions: {
            availableLanguages: {
              languages: ["en", "de", "fr"]
            }
          },
          multiAudio: {
            tracks: [
              {
                enabled: true,
                label: '',
                lang: 'eng',
                id: '1'
              },
              {
                enabled: false,
                label: '',
                lang: 'deu',
                id: '2'
              }
            ]
          }
        }
      }
    };

    DOM = TestUtils.renderIntoDocument(<ClosedCaptionMultiAudioMenu {...props} />);
  });

  afterEach(function() {
    selectedAudioId = null;
    selectedCaptionsId = null;
    props = {};
    DOM = null;
  });

  it('should be rendered', function() {
    var component = TestUtils.findRenderedComponentWithType(DOM, ClosedCaptionMultiAudioMenu);
    expect(component).toBeTruthy();
  });

  it('should render MultiAudioTab component', function() {
    var component = TestUtils.findRenderedComponentWithType(DOM, MultiAudioTab);

    expect(component).toBeTruthy();

    var tabComponent = TestUtils.scryRenderedComponentsWithType(DOM, Tab);

    var items = TestUtils.scryRenderedDOMComponentsWithClass(tabComponent[0], 'oo-cc-ma-menu__element');

    TestUtils.Simulate.click(items[0]);

    expect(selectedAudioId).toBe('1');
  });

  it('should also render Tab component when options are provided', function() {
    var tabComponent = TestUtils.scryRenderedComponentsWithType(DOM, Tab);

    var items = TestUtils.scryRenderedDOMComponentsWithClass(tabComponent[1], 'oo-cc-ma-menu__element');

    expect(items.length).toBe(3);
  });

  it('should not render neither tab not multiaudio when there\'s no data', function() {
    var emptyProps = {
      menuClassName: undefined,
      skinConfig: {},
      controller: {
        setCurrentAudio: function(id) {
          selectedAudioId = id;
        },
        onClosedCaptionChange: function(id) {
          selectedCaptionsId = id;
        },
        state: {
          
        }
      }
    };

    var tree = TestUtils.renderIntoDocument(<ClosedCaptionMultiAudioMenu {...emptyProps} />);
    var components = TestUtils.scryRenderedComponentsWithType(tree, Tab);

    expect(components.length).toBe(0);
  });

  it('should not call any callbacks when handlers are not defined', function() {
    var emptyHandlers = {
      menuClassName: undefined,
      skinConfig: {},
      controller: {
        state: {
          closedCaptionOptions: {
            availableLanguages: {
              languages: ["en", "fr"]
            }
          }
        }
      }
    };

    var tree = TestUtils.renderIntoDocument(<ClosedCaptionMultiAudioMenu {...emptyHandlers} />);
    var component = TestUtils.findRenderedComponentWithType(tree, Tab);

    var items = TestUtils.scryRenderedDOMComponentsWithClass(component, 'oo-cc-ma-menu__element');

    TestUtils.Simulate.click(items[0]);

    expect(selectedAudioId).toBe(null);
  });

});