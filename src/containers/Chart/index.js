import { connect } from 'react-redux';
import React, { Component } from 'react';

import Loader from '../../components/Loader';
import PriceChart from '../../components/PriceChart';
import { round } from '../../utils/math';

class Chart extends Component {

  // todo: return false, use child cart ref for update
  shouldComponentUpdate(nextProps) {
    if (this.priceChart && this.priceChart.chart) {

      // console.log('chartContainer shouldComponentUpdate');
      const nextConfig = this.config(nextProps);
      const thisConfig = this.config(this.props);
      const chart = this.priceChart.chart.getChart();
      const changedAxisLineIds = this.axisLinesChangedIds(thisConfig, nextConfig);


      // update series data
      if (this.dataChanged(thisConfig, nextConfig)) {
        for (let i = 0; i < chart.series.length; i += 1) {
          if (nextConfig.series[i]) {
            chart.series[i].setData(nextConfig.series[i].data);
          }
        }
      }

      // update series y-axis plot lines
      if (changedAxisLineIds.length > 0) {
        for (let i = 0; i < chart.yAxis.length; i += 1) {
          const chartY = chart.yAxis[i];
          if (chartY.plotLinesAndBands && chartY.plotLinesAndBands[0] && changedAxisLineIds.includes(chartY.plotLinesAndBands[0].id)) {
            // find eqivalent axis in new props
            let nextY;
            for (let j = 0; j < nextConfig.yAxis.length; j += 1) {
              nextY = nextConfig.yAxis[i];
              if (nextY.plotLines && nextY.plotLines[0] && nextY.plotLines[0].id.includes(chartY.plotLinesAndBands[0].id)) {
                break;
              }
            }
            // remove plotlines from axis
            chartY.removePlotLine(chartY.plotLinesAndBands[0].id);
            // add plot lines from eqivalent axis to chart
            for (let j = 0; j < nextY.plotLines.length; j += 1) {
              chart.yAxis[i].addPlotLine(nextY.plotLines[j]);
            }
          }
        }
      }

      // update x-axis plot lines
      if (this.testDataChanged(thisConfig, nextConfig)) {
        chart.xAxis[0].removePlotLine('testResult');
        for (let i = 0; i < nextConfig.xAxis.plotLines.length; i += 1) {
          chart.xAxis[0].addPlotLine(nextConfig.xAxis.plotLines[i]);
        }
      }
    }
    return JSON.stringify(this.props) !== JSON.stringify(nextProps);
  }

  dataChanged = (thisConfig, nextConfig) => {
    if (thisConfig.series.length !== nextConfig.series.length) {
      return true;
    }
    for (let i = 0; i < thisConfig.series.length; i += 1) {
      if (thisConfig.series[i].name !== nextConfig.series[i].name ||
      JSON.stringify(thisConfig.series[i].data) !== JSON.stringify(nextConfig.series[i].data)) {
        return true;
      }
    }
    return false;
  }

  testDataChanged = (thisConfig, nextConfig) => (
    JSON.stringify(thisConfig.xAxis.plotLines)
    !== JSON.stringify(nextConfig.xAxis.plotLines)
      || thisConfig.xAxis.plotLines.length !== nextConfig.xAxis.plotLines.length
  )

  axisLinesChangedIds = (thisConfig, nextConfig) => {
    const changedIds = [];
    for (let i = 0; i < nextConfig.yAxis.length; i += 1) {
      if (thisConfig.yAxis[i]) {
        if (JSON.stringify(nextConfig.yAxis[i].plotLines) !== JSON.stringify(thisConfig.yAxis[i].plotLines)) {
          if (thisConfig.yAxis[i].plotLines[0]) {
            changedIds.push(thisConfig.yAxis[i].plotLines[0].id);
          }
        }
      }
    }
    return changedIds;
  }

  inidcatorYAxis = (top, height, chartMin, chartMax, axisLines, id) => (
    {
      gridLineColor: 'transparent',
      labels: {
        align: 'left',
        x: 5,
        style: {
          color: 'white',
        },
      },
      offset: 0,
      top,
      height,
      lineWidth: 1,
      min: chartMin,
      max: chartMax,
      plotLines: axisLines ? axisLines.map(v => (
        {
          id,
          value: v,
          color: 'red',
          width: 1,
        }
      )) : [],
    }
  )

  // for srsi, map series for k and d
  indicatorSeries = (indicatorData, indicator, yAxisNumber) => {
    const seriesData = indicator.valueIds.map(id => {
      const series = {
        data: indicatorData.data.map(d => {
          return [d.time, d[id]];
        }),
        name: id,
      };
      // console.log(series);
      return series;
    });
    return seriesData.map(d => (
      {
        animation: false,
        data: d.data,
        type: 'line',
        name: d.name,
        tooltip: {
          valueDecimals: 2,
        },
        yAxis: yAxisNumber,
        dataGrouping: {
          enabled: false,
        },
        lineWidth: 1,
        states: {
          hover: {
            lineWidth: 1,
          },
        },
      }
    ));
  }

  indicatorConfig = (indicatorData, indicator, reservedHeight, numIndicators, axisIndex) => {
    if (indicator.renderOnMain) {
      return {
        series: this.indicatorSeries(indicatorData, indicator, 0),
      };
    }

    const height = ((100 - reservedHeight) / numIndicators);
    const top = 100 - (height * (axisIndex));

    return {
      yAxis: this.inidcatorYAxis(`${top}%`, `${height}%`, indicator.chartMin, indicator.chartMax, indicator.axisLines, indicator.id),
      series: this.indicatorSeries(indicatorData, indicator, axisIndex + 1),
    };
  }


  indicatorConfigs = (selectedIndicatorsData, indicators) => {
    const reservedHeight = 60;
    const greatestReservedAxisIndex = 1;
    let greatestAxisIndex = greatestReservedAxisIndex;
    let config = { yAxis: [], series: [] };
    const numIndicators = indicators.reduce((a, b) => (!b.renderOnMain ? a + 1 : a), 0);
    for (let i = 0; i < indicators.length; i += 1) {
      const indConf = this.indicatorConfig(selectedIndicatorsData[indicators[i].id], indicators[i], reservedHeight, numIndicators, greatestAxisIndex);
      if (indConf.yAxis) greatestAxisIndex += 1;
      config = {
        yAxis: indConf.yAxis ? [...config.yAxis, indConf.yAxis] : config.yAxis,
        series: [...config.series, ...indConf.series],
      };
    }
    return config;
  }

  testPlotLines = props => {
    return props.testResultData ? props.testResultData.map((d, i) => (
      { id: 'testResult',
        value: d.time,
        width: 2,
        color: d.price < 0 ? 'green' : 'red',
        dashStyle: d.loss ? 'dot' : 'solid',
        label: {
          text: d.label,
          verticalAlign: 'top',
          textAlign: 'left',
          rotation: 0,
          y: (i % 4) * 10,
        },
      }),
    ) : [];
  }

  candleStickConfig = (props, volumeOffset) => {
    return {
      yAxis: {
        gridLineColor: 'transparent',
        labels: {
          align: 'left',
          x: 5,
          style: {
            color: 'white',
          },
        },
        height: volumeOffset,
        lineWidth: 1,
        floor: 0,
      },
      series: {
        animation: false,
        name: props.productDisplayName,
        data: props.selectedProductPriceData,
        type: 'candlestick',
        tooltip: {
          valueDecimals: 2,
        },
        dataGrouping: {
          enabled: false,
        },
      },
    };
  }

  volumeConfig = (props, volumeOffset) => {
    return {
      yAxis: {
        gridLineColor: 'transparent',
        labels: {
          enabled: false,
          style: {
            color: 'white',
          },
        },
        top: volumeOffset,
        height: '10%',
        offset: 0,
        lineWidth: 1,
      },
      gridLineColor: 'transparent',
      series: {
        animation: false,
        type: 'column',
        name: 'Volume',
        dataGrouping: {
          enabled: false,
        },
        data: props.selectedProductVolumeData,
        yAxis: 1,
      },
    };
  }

  config = (props) => {
    // console.log('chartConfig', props.selectedIndicatorsData, props.selectedIndicators)
    const indicatorConfigs = this.indicatorConfigs(props.selectedIndicatorsData, props.selectedIndicators);
    const volumeOffset = indicatorConfigs.yAxis.length > 0 ? '50%' : '90%';
    const candleStickConfig = this.candleStickConfig(props, volumeOffset);
    const volumeConfig = this.volumeConfig(props, volumeOffset);
    const testPlotLines = this.testPlotLines(props);

    return {
      plotOptions: {
        candlestick: {
          lineColor: 'hsl(15, 83%, 61%)',
          color:'hsl(15, 83%, 61%)',
          upLineColor: 'hsl(101, 84%, 71%)',
          upColor: 'hsl(101, 84%, 71%)'
        }
      },
      tooltip: {
        enabled: false,
      },
      chart: {
        panning: false,
        animation: false,
        // zoomType: 'x',
        marginBottom: 15,
        backgroundColor: 'transparent',
      },
      mapNavigation: {
          enabled: false,
          enableButtons: false
      },
      credits: {
        enabled: false,
      },
      navigator: {
        enabled: false,
      },
      rangeSelector: {
        enabled: false,
      },
      xAxis: {
        plotLines: testPlotLines,
        labels: {
          y: 13,
          style: {
            color: 'white',
          },
        },
        tickLength: 3,
      },
      yAxis: [
        candleStickConfig.yAxis,
        volumeConfig.yAxis,
        ...indicatorConfigs.yAxis,
      ],
      series: [
        candleStickConfig.series,
        volumeConfig.series,
        ...indicatorConfigs.series,
      ],
      scrollbar: {
        enabled: false,
      },
      pane: {
        background: {
          borderWidth: 0,
        },
      },
    };
  }

  handleMouseOverEnter = () => {
    window.onwheel = function(){ return false; };
  }

  handleMouseOverExit = () => {
    window.onwheel = null;
  }

  render() {
   // console.log('rendering chart container');
    return (
      <div className="chart secondary-bg-dark">
        { this.props.selectedProductPriceData.length > 0 ?
          <div onMouseEnter={this.handleMouseOverEnter} onMouseLeave={this.handleMouseOverExit}>
            <PriceChart ref={(c) => { this.priceChart = c; }} config={this.config(this.props)}
          />
          </div>
          : <div>
            <Loader />
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => {

  const selectedProduct = state.profile.products.find(p => {
    return p.active;
  });

  const selectedProductData = state.chart.products.find(p => {
    return p.id === selectedProduct.id;
  });

  const productDisplayName = selectedProduct ? selectedProduct.label : '';

  const selectedIndicators = state.chart.indicators.filter(i => (i.active));

  const selectedIndicatorsData = selectedIndicators.reduce((indicatorIds, i) => {
    indicatorIds = [ ...indicatorIds, i.id ];
    return indicatorIds;
  }, []).reduce((data, indicatorId) => {
    data[indicatorId] = { data: selectedProductData[indicatorId] };
    return data;
  }, {});

  const selectedProductPriceData = selectedProductData && selectedProductData.data ?
      selectedProductData.data.map(d => ([d.time, d.open, d.high, d.low, d.close])) : [];

  const selectedProductVolumeData = selectedProductData && selectedProductData.data ?
      selectedProductData.data.map(d => ([d.time, round(d.volume, 2)])) : [];

  const testResultData = state.chart.testResult.data;

  return ({
    productDisplayName,
    selectedIndicators,
    selectedIndicatorsData,
    testResultData,
    selectedProductPriceData,
    selectedProductVolumeData,
  })
};

const ChartContainer = connect(
  mapStateToProps,
  null,
)(Chart);

export default ChartContainer;
