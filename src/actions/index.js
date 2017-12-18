import axios from 'axios';
import * as actionType from './actionTypes';
import {
  getAccounts,
  getOrders,
  getProductData,
  getProducts,
  deleteOrder,
  postLimitOrder,
  getFills,
} from '../utils/api';
import { INIT_RANGE, INIT_GRANULARITY } from '../utils/constants';
import run from '../utils/scriptEnv';
import connect, { setActions, subscribeToTicker, subscribeToOrderBook } from '../utils/websocket';
import { floor } from '../utils/math';

let nextScriptId = 2;

// profile
export const importProfile = userData => ({ type: actionType.IMPORT_PROFILE, userData });
export const saveProfile = settings => ({ type: actionType.SAVE_PROFILE, settings });
export const saveSession = session => ({ type: actionType.SAVE_SESSION, session });
export const updateAccounts = accounts => ({ type: actionType.UPDATE_ACCOUNTS, accounts });
export const addOrder = (id, productId, time, price) => ({ type: actionType.ADD_ORDER, id, productId, time, price });
export const setOrders = (product, orders) => ({ type: actionType.SET_ORDERS, product, orders});
export const addActiveOrder = (productId, order) => ({ type: actionType.ADD_ACTIVE_ORDER, productId, order});
export const deleteActiveOrder = (productId, orderId) => ({ type: actionType.DELETE_ACTIVE_ORDER, productId, orderId});
export const setCancelling = (productId, orderId) => ({ type: actionType.SET_CANCELLING, productId, orderId});
export const setFills = (productId, fills) => ({ type: actionType.SET_FILLS, productId, fills });

// websocket
export const setProductWSData = (id, data) => ({ type: actionType.SET_PRODUCT_WS_DATA, id, data });
export const addProductWSData = data => ({ type: actionType.ADD_PRODUCT_WS_DATA, data });
export const setTickerWSData = data => ({type: actionType.SET_TICKER_WS_DATA, data});

// dashboard: charts
export const setProducts = products => ({ type: actionType.SET_PRODUCTS, products });
export const selectProduct = id => ({ type: actionType.SELECT_PRODUCT, id });
export const setProductData = (id, data) => ({ type: actionType.SET_PRODUCT_DATA, id, data });
export const addProductData = (id, data) => ({ type: actionType.ADD_PRODUCT_DATA, id, data });
export const selectDateRange = (id, range) => ({ type: actionType.SELECT_DATE_RANGE, id, range });
export const setGranularity = (id, granularity) =>
  ({ type: actionType.SET_GRANULARITY, id, granularity });
export const selectIndicator = id => ({ type: actionType.SELECT_INDICATOR, id });
export const editIndicator = indicator => ({ type: actionType.EDIT_INDICATOR, indicator });
export const setOrderBook = (id, orderBook) =>
  ({ type: actionType.SET_ORDER_BOOK, id, orderBook });
  export const updateOrderBook = (id, changes) =>
  ({ type: actionType.UPDATE_ORDER_BOOK, id, changes });
export const updateHeartbeat = status => ({ type: actionType.UPDATE_HEARTBEAT, status });
export const setFetchingStatus = status => ({ type: actionType.SET_FETCHING_STATUS, status });
export const calculateIndicators = id => ({ type: actionType.CALCULATE_INDICATORS, id });

// dashpbard: scratchpad
export const addScript = () => ({ type: actionType.ADD_SCRIPT, id: nextScriptId += 1 });
export const writeScript = script => ({ type: actionType.SAVE_SCRIPT, script });
export const deleteScript = id => ({ type: actionType.DELETE_SCRIPT, id });
export const selectScript = id => ({ type: actionType.SELECT_SCRIPT, id });
export const selectProductDoc = id => ({ type: actionType.SELECT_PRODUCT_DOC, id });
export const toggleScriptLive = id => ({ type: actionType.TOGGLE_SCRIPT_LIVE, id });
export const saveTestResult = result => ({ type: actionType.SAVE_TEST_RESULT, result });

export const saveScript = script => (
  dispatch => (
    new Promise((resolve) => {
      dispatch(writeScript(script));
      resolve();
    })
  )
);

// logging
export const appendLog = log => ({ type: actionType.APPEND_LOG, log });
export const clearLog = () => ({ type: actionType.CLEAR_LOG });

// location
export const setLocation = location => ({ type: actionType.SET_LOCATION, location });

// cards
export const showCard = (card, content) => ({ type: actionType.SHOW_CARD, card, content });

// api
export const placeLimitOrder = (appOrderType, side, productId, price, amount) => {
  return (dispatch, getState) => {
    if (appOrderType === 'bestPrice' || appOrderType === 'activeBestPrice') {
      const productWSData = getState().websocket.products.find(wsProduct => wsProduct.id === productId);
      if (side === 'buy') {
        //match highest bid price, first bid.price
        price = productWSData.bids[0].price;
      } else if (side ==='sell') {
        // match lowest ask price, last ask.price
        price = productWSData.asks[productWSData.asks.length - 1].price;
      }
    }
    return postLimitOrder(side, productId, price, amount, getState().profile.session).then(res => {
      console.log('order response', res);
      // add order id to watched order id list, to replace order when needed
      dispatch(fetchOrders(productId));
      dispatch(fetchFills(productId));
      if (res && appOrderType === 'activeBestPrice') {
        dispatch(addActiveOrder(res.product_id, res));
      }
      return res;
    });
  }
}

export const cancelOrder = order => (
  (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      // dispatch(setCancelling(order.product_id, order.id));
      deleteOrder(order.id, getState().profile.session).then(() => {
        console.log('delete order request completed', order);
        dispatch(deleteActiveOrder(order.product_id, order.id));
        dispatch(fetchOrders(order.product_id));
        dispatch(fetchFills(order.product_id));
        resolve();
      })
    });
  }
);

export const fetchAccounts = (session) => (
  (dispatch, getState) => {
    session = session ? session : getState().profile.session;
    return getAccounts(session).then((accounts) => {
      if (accounts) {
        dispatch(updateAccounts(accounts));
        return true;
      }
      return false;
    })
  }
);

export const fetchOrders = (product, session) => {
  return (dispatch, getState) => {
    session = session ? session : getState().profile.session;
    return getOrders(product, session).then((orders) => {
      dispatch(setOrders(product, orders));
    })
  };
}

export const fetchFills = (product, session) => {
  return (dispatch, getState) => {
    session = session ? session : getState().profile.session;
    return getFills(product, session).then((fills) => {
      dispatch(setFills(product, fills));
    })
  };
}

export const fetchProductData = (id, range, granularity) => (
  (dispatch) => {
    dispatch(setFetchingStatus('fetching'));
    return getProductData(id, range, granularity).then((data) => {
      dispatch(setProductData(id, data));
      dispatch(setFetchingStatus('success'));
    }).catch((err) => {
      console.warn(err);
      dispatch(setFetchingStatus('failure'));
    });
  }
);

export const initProducts = () => (
  (dispatch, getState) => (
    getProducts().then((products) => {
      dispatch(setProducts(products.data));
      const state = getState();
      const selectedProductIds = state.profile.products.map(p => (p.id));
      dispatch(selectProduct(selectedProductIds[0]));
      dispatch(fetchProductData(selectedProductIds[0], INIT_RANGE, INIT_GRANULARITY));
      if (state.profile.session) {
        dispatch(fetchOrders(selectedProductIds[0]));
        dispatch(fetchFills(selectedProductIds[0]));
        dispatch(fetchAccounts(state.profile.session));
      }
      dispatch(initWebsocket(selectedProductIds[0], selectedProductIds));
    })
  )
);

export const fetchSettings = acceptedFiles => (
  dispatch => (
    axios.create({ baseURL: '' }).get(acceptedFiles[0].preview).then((res) => {
      dispatch(importProfile(res.data));
      return res.data;
    })
  )
);

export const findSession = acceptedFiles => (
  (dispatch, getState) => (
    axios.create({ baseURL: '' }).get(acceptedFiles[0].preview).then((res) => {
      const content = res.data;
      const key = 'session';
      const idLength = 64;
      const re = new RegExp('^[a-z0-9]+$');
      const sessionLocations = [];
      let index = 0;

      // get indexs of key
      while (index < content.length) {
        index = content.indexOf(key, index);
        sessionLocations.push(index);
        if (index === -1) break;
        index += 1;
      }

      // get string os idLength past the key positions then filter strings with non-alpha-num chars
      const sessions = sessionLocations.map(s => (
        content.substring(s + key.length, s + key.length + idLength)
      )).filter(s => (
        re.test(s)
      ));

      // call accounts api with remainng session ids
      for (let i = 0; i < sessions.length; i += 1) {
        getAccounts(sessions[i]).then((accounts) => {
          if (accounts) {
            dispatch(saveSession(sessions[i]));
            dispatch(updateAccounts(accounts));
          }
        });
      }
    })
  )
);

/*
 * Websocket
*/

// handles realtime price data
const handleMatch = dispatch => {
  return data => {
    dispatch(addProductWSData(data));
  }
}

const transformOrderData = order => {
  return {
    price: parseFloat(order[0]).toFixed(2),
    size: parseFloat(order[1]).toFixed(8),
  }
}

// handles initial orderbook data
const handleSnapshot = dispatch => {
  return data => {
    // console.log('actions/index.js handleSnapshot', data);
    let bids = [];
    for (let i = 0; i < data.bids.length; i +=1 ) {
      if (bids.length > 0 && bids[bids.length - 1][0] === data.bids[i][0]) {
        bids[bids.length - 1].size += parseFloat(data.bids[i][1]).toFixed(8);
      } else if (parseFloat(data.bids[i][1]) > 0) {
        bids.push(transformOrderData(data.bids[i]));
      }
    }
    let asks = [];
    for (let i = 0; i < data.asks.length; i +=1 ) {
      if (asks.length > 0 && asks[asks.length - 1][0] === data.asks[i][0]) {
        asks[asks.length - 1].size += parseFloat(data.asks[i][1]).toFixed(8);
      } else if (parseFloat(data.asks[i][1]) > 0) {
        asks.push(transformOrderData(data.asks[i]));
      }
    }
    dispatch(setOrderBook(data.product_id, { bids: bids, asks: asks }))
  }
}

const bestAsk = (getState, productId) => {
  // console.log('getting best ask', productId);
  const wsProductData = getState().websocket.products.find(p => (p.id === productId));
  // console.log('bestAsk is', wsProductData.asks[wsProductData.asks.length - 1].price);
  return wsProductData.asks[wsProductData.asks.length - 1].price;
}

const bestBid = (getState, productId) => {
  const wsProductData = getState().websocket.products.find(p => (p.id === productId));
  return wsProductData.bids[0].price;
}

const ordersBeingHandled = [];

// handles new orderbook diff
// BUG - active orders do not get deleted!
const handleUpdate = (dispatch, getState) => {
  return data => {
    dispatch(updateOrderBook(data.product_id, data.changes));
    const state = getState();
    const scriptHeaderd = state.scripts.find(s => (s.id === 0));
    const activeScripts = state.scripts.map(s => (s.active));
    const activeOrders = state.profile.activeOrders[data.product_id];
    /*
      Run all scripts wich are live
    */
    // for (let i = 0; i < activeScripts.length; i +=1 ) {
    //   // run({
    //   //   script: scriptHeaderd + ';' + activeScripts,
    //   // });
    // }

    // get best price and update active orders
    /*
      All of the code below this line is for handling canelling and re-placing of active orders
    */

    if (activeOrders && activeOrders.length > 0) {
      // for each active order
      for (let i = 0; i < activeOrders.length; i +=1) {
        const order = { ...activeOrders[i] };
        // console.log('order to update id', order.id);
        // console.log('orders being handled', ordersBeingHandled);
        let orderHandleIndex = ordersBeingHandled.indexOf(order.id);
        // console.log('index of candidate order in handle array', orderHandleIndex);
        if (orderHandleIndex < 0) {
            ordersBeingHandled.push(order.id);
            // console.log('order is handleing added', order.id);
            // if order is sell and order price is greater than bestAsk
          if (order.side === 'sell' && Number(order.price) > bestAsk(getState, order.product_id)) {
            // console.log('cancelling sell order', order);
            // cancel order
            dispatch(cancelOrder(order)).then(() => {
              // re-place order. keep size constant, adjust price
              order.price = floor(bestAsk(getState, order.product_id), 2);
              // console.log('replacing sell order', order);
              dispatch(placeLimitOrder('activeBestPrice', order.side, order.product_id, order.price, order.size));
              orderHandleIndex = ordersBeingHandled.indexOf(order.id);
              ordersBeingHandled.splice(orderHandleIndex, 1);
              // console.log('order is handleing removed', order.id);
            });
          }
          // if order is buy and order price is less than bestBid
          else if (order.side === 'buy' && Number(order.price) < bestBid(getState, order.product_id)) {
            // cancel order
            dispatch(cancelOrder(order)).then(() => {
              // re-place order. keep total (price * amount) constant
              const total = order.price * order.size;
              const newPrice = bestBid(getState, order.product_id);
              order.size = floor((total / newPrice), 8);
              order.price = newPrice;
              dispatch(placeLimitOrder('activeBestPrice', order.side, order.product_id, order.price, order.size));
              orderHandleIndex = ordersBeingHandled.indexOf(order.id);
              ordersBeingHandled.splice(orderHandleIndex, 1);
              // console.log('order is handleing removed', order.id);
            });
          } else {
            orderHandleIndex = ordersBeingHandled.indexOf(order.id);
            ordersBeingHandled.splice(orderHandleIndex, 1);
            // console.log('order is handleing removed', order.id);
          }
        }
      }
    }
  }
}

// handles ticker price for all products
const handleTicker = dispatch => {
  return data => {
    dispatch(setTickerWSData(data))
  }
}

// when a user's order is matched, delete the order
const handleDeleteOrder = (dispatch) => {
  return data => {
    dispatch(deleteActiveOrder(data.product_id, data.order_id));
    dispatch(fetchOrders(data.product_id));
    dispatch(fetchFills(data.product_id));
  }
}

// initialize all websocket stuff
export const initWebsocket = (activeId, ids) => (
  (dispatch, getState) => (
    connect().then(() => {
      // pass in methods that the WS will need to call.
      // console.log('initwebsocker', activeId, ids);
      setActions(handleMatch(dispatch), handleSnapshot(dispatch), handleUpdate(dispatch, getState), handleTicker(dispatch), handleDeleteOrder(dispatch));
      subscribeToTicker(ids)
      subscribeToOrderBook(activeId, getState().profile.session);
    })
  )
);
