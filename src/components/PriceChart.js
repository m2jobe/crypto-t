import React, { Component } from 'react';
import ReactHighstock from 'react-highcharts/ReactHighstock.src';
import PropTypes from 'prop-types';
require('highcharts-map')(ReactHighstock.Highcharts)

export default class PriceChart extends Component {

  // TODO: this should always be fale. Should instead use highcharts api to change data and redraw.
  // update if config name changed, series length, or yAxis length changed
  shouldComponentUpdate = nextProps => {
    return (
      this.props.config.series[0].name !== nextProps.config.series[0].name ||
      this.props.config.yAxis.length !== nextProps.config.yAxis.length ||
      this.props.config.series.length !== nextProps.config.series.length
    )
  }

  render() {
    // console.log('rendering PriceChart');
    return (
      <ReactHighstock domProps={{ className: 'chart' }} config={this.props.config} ref={(c) => { this.chart = c; }} />
    );
  }
}


PriceChart.propTypes = {
  config: PropTypes.object.isRequired,
};
