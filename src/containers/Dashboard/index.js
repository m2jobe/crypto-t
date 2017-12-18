import React from 'react';

import ChartHeaderContainer from '../ChartHeader';
import ChartContainer from '../Chart';
import WebsocketChartContainer from '../WebsocketChart';
import OrderBookContainer from '../Orderbook';
import ScratchpadContainer from '../Scratchpad';
import CardHeader from '../CardHeader';
import DepthChartContainer from '../DepthChart';
import ManualOrderContainer from '../ManualOrder';
import OrderHistoryContainer from '../OrderHistory';

export const Dashboard = () => {
  // console.log('rendering dashboard');
  return (
    <div className="flex-1 flex-column container third-bg-dark">
      <div className="container">
        <div className="columns">
          <div className="col-10 col-lg-6 col-sm-12">
            <div className="container">
              <div className="columns px-1">
                <div className="col-6 hide-md">
                  <ChartHeaderContainer />
                  <ChartContainer />
                </div>
                <div className="col-6 col-lg-12 col-sm-12">
                  <CardHeader position={'topCenter'} contentOptions={['Price', 'Depth']}/>
                  <DepthChartContainer position={'topCenter'} />
                  <WebsocketChartContainer position={'topCenter'} />
                </div>
              </div>
            </div>
          </div>
          <div className="secondary-bg-dark col-2 col-lg-6 col-sm-12">
            <CardHeader position={'topRight'} contentOptions={['Order Book']}/>
            <OrderBookContainer position={'topRight'} />
          </div>
        </div>
      </div>
      <div className="container flex-column flex-1">
        <div className="flex-1 columns">
          <div className="container flex-column col-8 hide-md">
            <CardHeader position={'bottomLeft'} contentOptions={['Scripts', 'Orders']}/>
            <ScratchpadContainer className="container flex-1 d-flex" position={'bottomLeft'}/>
            <OrderHistoryContainer className="container flex-1 d-flex" position={'bottomLeft'}/>
          </div>
          <div className="container flex-column col-4 col-lg-12">
            <CardHeader position={'bottomRight'} contentOptions={['Trade']}/>
            <ManualOrderContainer position={'bottomRight'}/>
          </div>
        </div>
      </div>
    </div>
  );
}
