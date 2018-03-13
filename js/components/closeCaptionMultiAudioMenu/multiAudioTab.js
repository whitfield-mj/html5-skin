var React = require('react');
var BaseTab = require('./baseTab');

var MultiAudioTab = React.createClass({
  componentWillMount: function () {
    this.header = "Audio";
    this.list = [];
    this.updateList(this.props);
  },

  componentWillUpdate: function (nextProps, nextState) {
    this.updateList(nextProps);
  },

  updateList: function (props) {
    if(props && props.list){
      props.list.forEach(function (el, index) {
        this.list[index] = {
          selected: el.enabled,
          name: el.label,
          id: el.id
        };
      }.bind(this));
    }
  },

  handleSelect: function (id) {
    console.warn('multiAudioTab handleSelect id', id);

    this.props.handleSelect(id);
  },

  render: function () {
    return <BaseTab handleSelect={this.handleSelect} header={this.header} list={this.list}/>;
  }
});

module.exports = MultiAudioTab;