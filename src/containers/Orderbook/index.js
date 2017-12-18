import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';

class Orderbook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrolled: false,
      lastUpdateTime: 0,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const updateTimeValid = Date.now() - this.state.lastUpdateTime > 200;
    return JSON.stringify(this.props) !== JSON.stringify(nextProps) && updateTimeValid;
  }

  resetTimer() {
    this.setState(() => ({
      lastUpdateTime: Date.now(),
    }));
  }

  componentDidUpdate(prevProps) {
    this.resetTimer();
    if (!this.props.visible && this.state.scrolled) {
      this.setState(() => (
        { scrolled: false }
      ));
    }
    if (this.focus && !this.state.scrolled) {
      const node = ReactDOM.findDOMNode(this.focus);
      if (node) {
        node.scrollIntoView(false);
        this.setState(() => (
          { scrolled: true }
        ));
      }
    }
  }
  // y = ( $maxPixles x^2 ) / ( x^2 + $damperConstant )
  // todo: damper constant = f(average size order per price) =~ f( C * 1 / maket rate), c = 1600000
  barWidth(size) {
    const damper = 160000 / this.props.bids[0].price;
    return {
      height: '14px',
      width: `${30*Math.pow(size, 2) / (Math.pow(size, 2) + damper)}px`,
    }
  }

  render() {
    // console.log('rendering orderbook');
    return ( this.props.visible &&
      <div className="">
        <div className="container order-book secondary-bg-dark">
          { this.props.asks &&
            this.props.asks.map((ask, i) => (
            <div className="columns px-1 orderbook-row asks" key={i} >
              <div className="col-2"><div className="ask bar-container"><span style={this.barWidth(ask.size)} className="bar"/></div></div>
              <div className="col-5"><span className="col-6 ask size">{`${(ask.size)}`}</span></div>
              <div className="col-5"><span className="col-3 ask price">{`$ ${ask.price}`}</span></div>
            </div>
          ))}
          { this.props.asks && this.props.asks.length > 0 &&
            <div className="orderbook-row spread">
              <div className="columns px-1">
                <span className="col-2" />
                <span className="col-5">SPREAD</span>
                <span className="col-5">
                  ${(this.props.asks[this.props.asks.length - 1].price
                      - this.props.bids[0].price).toFixed(2) }
                </span>
              </div>
            </div>
          }
          { this.props.bids &&
            this.props.bids.map((bid, i) => (
            <div className="columns px-1 orderbook-row bids" key={i} ref={(c) => { if (i === 11) this.focus = c; }}>
              <div className="col-2"><div className="bid bar-container"><span style={this.barWidth(bid.size)} className="bar"/></div></div>
              <div className="col-5"><span className="bid size">{`${bid.size}`}</span></div>
              <div className="col-5"><span className="bid price">{`$ ${bid.price}`}</span></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const content = 'Order Book';
  const visible = state.view.topRight.find(c => (c.id === content)).selected;

  const selectedProduct = state.profile.products.find(p => {
    return p.active;
  });

  const selectedWebsocket = state.websocket.products.find(p => {
    return p.id === selectedProduct.id;
  });

  const asks = selectedWebsocket && selectedWebsocket.asks ? selectedWebsocket.asks.slice(selectedWebsocket.asks.length - 25, selectedWebsocket.asks.length - 0) : [];
  const bids = selectedWebsocket && selectedWebsocket.bids ? selectedWebsocket.bids.slice(0, 25) : [];

  return ({
    content,
    visible,
    asks,
    bids,
  })
};

const OrderbookContainer = connect(
  mapStateToProps,
  null,
)(Orderbook);

export default OrderbookContainer;
