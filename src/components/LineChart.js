import React, { Component } from 'react';
import ReactHighcharts from 'react-highcharts/ReactHighcharts.src';
import PropTypes from 'prop-types';
require('highcharts-map')(ReactHighcharts.Highcharts)


export default class PriceChart extends Component {

  shouldComponentUpdate = nextProps => (false)

  render() {
    // console.log('rendering LineChart');
    return (
      <ReactHighcharts domProps={{ className: 'chart' }} config={this.props.config} ref={(c) => { this[this.props.refName] = c; }} />
    );
  }
}

PriceChart.propTypes = {
  config: PropTypes.object.isRequired,
};
