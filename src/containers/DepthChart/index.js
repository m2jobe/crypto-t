import React, { Component } from 'react';
import { connect } from 'react-redux';

import LineChart from '../../components/LineChart';
import Loader from '../../components/Loader';
import ConnectedGlyph from '../../components/ConnectedGlyph';

class DepthChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lastUpdateTime: Date.now(),
    };
  }

  // return false, do update with child chart API via ref
  shouldComponentUpdate(nextProps) {
    const updateTimeValid = Date.now() - this.state.lastUpdateTime > 1000
    // do updates via highchars update apis
    if(this.lineChart && this.lineChart.depthchart && updateTimeValid) {
      const chart = this.lineChart.depthchart.getChart();
      const nextConfig = this.config(nextProps);
      window.chartRef = chart;
      if (this.dataChanged(nextConfig)) {
        // update series
        for (let i = 0; i < chart.series.length; i += 1) {
          if (nextConfig.series[i]) {
            chart.series[i].update({
              name: nextConfig.series[i].name,
              data: nextConfig.series[i].data,
            });
          }
        }
        //update xAxis
        for (let i = 0; i < nextConfig.xAxis.length; i += 1) {
          chart.xAxis[i].update({ ...nextConfig.xAxis[i] });
        }
        // console.log('update map nav');
        chart.update({ mapNavigation: { ...nextConfig.mapNavigation } });
        this.setState(() => ({
          lastUpdateTime: Date.now(),
        }));
      }
    }
    // eslint disable next line
    const getMidMarketPriceChanged = this.getMidMarketPrice(nextProps) !== this.getMidMarketPrice(this.props);

    return  (
              ( // order book changes that happen a lot
                (this.props.asks.length === 0 && nextProps.asks.length > 0)
                || getMidMarketPriceChanged
              )
              // thus should be rate limited
              && updateTimeValid
            )
            // these are application state changes which should always trigger a rerender
            || this.props.visible !== nextProps.visible
            || this.props.connected !== nextProps.connected;
  }

  dataChanged = (nextConfig) => {
    return JSON.stringify(this.config(this.props).series[0].data) !== JSON.stringify(nextConfig.series[0].data)
      || JSON.stringify(this.config(this.props).series[1].data) !== JSON.stringify(nextConfig.series[1].data);
  }

  handleZoomIn = (e) => {
    e.preventDefault();
    const chart = this.lineChart.depthchart.getChart();
    chart.mapZoom(0.5, this.props.asks[0][0], 0);
  }

  handleZoomOut = (e) => {
    e.preventDefault();
    const chart = this.lineChart.depthchart.getChart();
    chart.mapZoom(2, this.props.asks[0][0], 0);
  }

  config = (props) => {
    const yAxisHeight = props.asks.length > 0 ? Math.ceil(100*props.asks[props.asks.length - 1][1])/100 : 100;
    return {
      plotOptions: {
        column: {
          borderWidth: 0,
        }
      },
      title:{
        text: null
      },
      legend: {
        enabled: false,
      },
      rangeSelector: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      chart: {
        animation: false,
        // zoomType: 'x',
        type: 'area',
        backgroundColor: 'transparent',
      },
      tooltip: {
        enabled: false,
      },
      mapNavigation: {
        buttonOptions: {
          //align: 'center',
          // alignTo: 'spacingBox',
          x: 20,
        },
        enableButtons: false,
      },
      xAxis: [{
        minRange: 10,
        allowDecimals: false,
        labels: {
          y: 13,
          style: {
            color: 'white',
          },
        },
        title: { text: null },
        reversed: false,
        tickLength: 3,
        type: 'linear',
      }],
      yAxis: [{
        gridLineColor: 'transparent',
        title: { text: null },
        min: 0,
        max: yAxisHeight,
        allowDecimals: false,
        labels: {
          align: 'right',
          x: -5,
          style: {
            color: 'white',
          },
        },
        opposite: true,
        lineWidth: 1,
      },
      {
        gridLineColor: 'transparent',
        title: { text: null },
        min: 0,
        max: 1,
        allowDecimals: false,
        labels: {
          enabled: false,
        },
        lineWidth: 0,
      }],
      series: [{
        data: props.bids,
        animation: false,
        tooltip: {
          valueDecimals: 2,
        },
        color: '#4db51c',
        fillOpacity: 0.3,
        yAxis: 0
      },
      {
        data: props.asks,
        animation: false,
        tooltip: {
          valueDecimals: 2,
        },
        color: '#9b3a1a',
        fillOpacity: 0.3,
        yAxis: 0,
      },
      {
        animation: false,
        type: 'column',
        color: 'rgba(255,255,255,0.2)',
        data: [
          [ props.asks.length > 0 ? props.asks[0][0] : 0 , 3.5],
        ],
        yAxis: 1,
      }
      ],
      navigator: {
        enabled: false,
      },
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

  getMidMarketPrice = (props) => {
    return props.asks.length > 0 ? props.asks[0][0] - ((props.asks[0][0] - props.bids[props.bids.length - 1][0]) / 2) : 0;
  }

  render() {
   // console.log('rendering DepthChartContainer');
   // console.log('DepthChartTimer', Date.now() - this.state.lastUpdateTime, 1000);
    return ( this.props.visible &&
      <div className="chart secondary-bg-dark">
        <ConnectedGlyph connected={this.props.connected}/>
        { this.props.asks.length > 0 ?
          <div className="">
            <div className="btn-chart">
              <button className="btn btn-action minus" onClick={this.handleZoomOut} ><i className="icon icon-minus"></i></button>
              <button className="btn btn-action plus" onClick={this.handleZoomIn} ><i className="icon icon-plus"></i></button>
            </div>
            <LineChart
              config={this.config(this.props)}
              ref={(c) => { this.lineChart = c; }}
              refName="depthchart"
            />
          </div>
          : <div className="loading-message">
            <Loader />
            <p className="message">{`Chart will render when realtime data is received for
              ${this.props.productDisplayName ? this.props.productDisplayName : 'the selected product'}`}</p>
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => {
  const content = 'Depth';
  const visible = state.view.topCenter.find(c => (c.id === content)).selected;
  const connected = state.websocket.connected;

  const selectedProduct = state.profile.products.find(p => {
    return p.active;
  });

  const selectedWebsocket = state.websocket.products.find(p => {
    return p.id === selectedProduct.id;
  });

  let asks = [];
  let bids = [];

  if (selectedWebsocket && selectedWebsocket.asks && selectedWebsocket.bids && selectedWebsocket.asks.length > 0 && selectedWebsocket.bids.length > 0) {

    const minAsk = parseFloat(selectedWebsocket.asks[selectedWebsocket.asks.length - 1].price);
    const maxAsk = parseFloat(selectedWebsocket.asks[0].price);

    const minBid = parseFloat(selectedWebsocket.bids[selectedWebsocket.bids.length - 1].price);
    const maxBid = parseFloat(selectedWebsocket.bids[0].price);

    // get the minimum range for the order book, so that the longer data set can be truncated
    const minRange = Math.min(
      maxAsk - minAsk,
      maxBid - minBid,
    );

    const maxAllowedAsk = minAsk + minRange;
    const minAllowedBid = maxBid - minRange;

    // add up the size of the orders at each price level to create a volume
    asks = selectedWebsocket.asks.slice().reverse().reduce((data, ask) => {
        const volume = data.length > 0 ? parseFloat(ask.size) + data[data.length - 1][1] : parseFloat(ask.size);
        const price = parseFloat(ask.price);
        if (price <= maxAllowedAsk) {
          // add data at same price - Number.MIN_VALUE with last volume so you get the level steps
          if(data.length > 0) data.push([price - Number.MIN_VALUE, data[data.length - 1][1]]);
          data.push([price, volume])
        }
        return data;
      }, []);

    // add up the size of the orders at each price level to create a volume
    bids = selectedWebsocket.bids.slice().reduce((data, bid) => {
        const volume = data.length > 0 ? parseFloat(bid.size) + data[0][1] : parseFloat(bid.size);
        const price = parseFloat(bid.price);
        if (price >= minAllowedBid) {
          // add data at same price - Number.MIN_VALUE with last volume so you get the level steps
          if(data.length > 0) data.unshift([price + Number.MIN_VALUE, data[0][1]]);
          data.unshift([price, volume]);
        }
        return data;
      }, []);//.reverse();

    // make sure a data point exists at range max so chart always has correct range
    asks.push([maxAllowedAsk, asks[asks.length - 1][1]]);
    bids.unshift([minAllowedBid, bids[0][1]]);
  }

  return ({
    content,
    visible,
    asks,
    bids,
    connected
  })
};

const DepthChartContainer = connect(
  mapStateToProps,
  null,
)(DepthChart);

export default DepthChartContainer;
