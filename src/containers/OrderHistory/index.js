import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import {
  cancelOrder,
} from '../../actions';

class OrderHistory extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(this.props) !== JSON.stringify(nextProps);
  }

  handleClick(e, order) {
    e.preventDefault();
    console.log('canceling order', order.id);
    this.props.cancelOrder(order);
  }

  render() {
   // console.log('renderig orders container', this.props);
    return ( this.props.visible &&
      <div className="container d-flex flex-1 secondary-bg-dark">
        <div className="flex-1 scroll-y">
          <div key="heading" className="columns border-bottom-thick px-2">
            <div className="col-1 text-center text-light">Type</div>
            <div className="col-2 text-center text-light">Size</div>
            <div className="col-2 text-center text-light">Filled (BTC)</div>
            <div className="col-2 text-center text-light">Price (USD)</div>
            <div className="col-2 text-center text-light">Fee (USD)</div>
            <div className="col-1 text-center text-light">Time</div>
            <div className="col-1 text-center text-light">Status</div>
          </div>
          { this.props.orders.map(order => {
              const color = order.type === 'buy' ? 'green' : 'red';
              return (
                <div key={order.id} className="columns border-bottom-light px-2">
                  <div className={`col-1 text-center text-light ${color}`}>{order.type}</div>
                  <div className={`col-2 text-center text-light ${color}`}>{order.size}</div>
                  <div className={`col-2 text-center text-light ${color}`}>{order.filled_size}</div>
                  <div className={`col-2 text-center text-light ${color}`}>{Number(order.price).toFixed(2)}</div>
                  <div className={`col-2 text-center text-light ${color}`}>{Number(order.fill_fees).toFixed(2)}</div>
                  <div className={`small col-1 text-center text-light ${color}`}>{moment(order.created_at).fromNow()}</div>
                  <div className={`col-1 text-center text-light ${color}`}>{order.status}</div>
                  <button className="col-1 btn bg-error btn-order" onClick={(e) => { this.handleClick(e, order)}}>Cancel</button>
                </div>
              );
            })
          }
          <div className="columns border-bottom-thick px-2"></div>
          { this.props.fills.map(fill => {
              const color = fill.side === 'buy' ? 'green' : 'red';
              return (
                <div key={fill.id} className="columns border-bottom-light px-2">
                  <div className={`col-1 text-center text-light ${color}`}></div>
                  <div className={`col-4 text-center text-light ${color}`}>{fill.size}</div>
                  <div className={`col-2 text-center text-light ${color}`}>{Number(fill.price).toFixed(2)}</div>
                  <div className={`col-2 text-center text-light ${color}`}>{Number(fill.fee).toFixed(2)}</div>
                  <div className={`small col-1 text-center text-light ${color}`}>{moment(fill.created_at).fromNow()}</div>
                  <div className={`col-1 text-center text-light ${color}`}>filled</div>
                  <div className={`col-1 text-center text-light ${color}`}></div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const content = 'Orders';
  const visible = state.view.bottomLeft.find(c => (c.id === content)).selected;
  const selectedProduct = state.profile.products.find(p => {
    return p.active;
  });
  const orders = state.profile.orders[selectedProduct.id];
  const fills = state.profile.fills[selectedProduct.id];

  return ({
    content,
    visible,
    orders: orders ? orders : [],
    fills: fills ? fills : [],
  })
};

const mapDispatchToProps = dispatch => (
  {
    cancelOrder: (order) => {
      dispatch(cancelOrder(order));
    },
  }
);

const OrderHistoryContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OrderHistory);

export default OrderHistoryContainer;
