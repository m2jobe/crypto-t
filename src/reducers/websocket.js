import moment from 'moment';

import * as actionType from '../actions/actionTypes';

export const INIT_WEBSOCKET_STATE = {
  connected: false,
  heartbeatTime: 0,
  products: [
    { id: 'LTC-EUR', data: [] },
    { id: 'LTC-BTC', data: [] },
    { id: 'BTC-GBP', data: [] },
    { id: 'BTC-EUR', data: [] },
    { id: 'ETH-EUR', data: [] },
    { id: 'ETH-BTC', data: [] },
    { id: 'LTC-USD', data: [] },
    { id: 'BTC-USD', data: [] },
    { id: 'ETH-USD', data: [] },
  ],
};

const maxOrderbookLength = 300;

const websocket = (state = INIT_WEBSOCKET_STATE, action) => {
  switch (action.type) {
    case actionType.ADD_PRODUCT_WS_DATA:
      return { ...state,
        products: state.products.map((p) => {
          const product = { ...p };
          if (product.id === action.data.product_id && action.data.price && action.data.size) {
            product.data = [...product.data,
              {
                ...action.data,
                time: moment(action.data.time).valueOf(),
                size: Number(action.data.size),
                price: Number(action.data.price),
              }];
            // if multiple transactions per ms, average the transactions
            const cleanData = [];
            for (let i = 0; i < product.data.length; i += 1) {
              const d = product.data[i];
              if (product.data[i + 1] && product.data[i].time === product.data[i + 1].time) {
                d.price = (d.price + product.data[i + 1].price) / 2;
                d.size = (d.size + product.data[i + 1].size) / 2;
                i += 1;
              }
              cleanData.push(d);
            }
            product.data = cleanData;
          }
          return product;
        }),
        connected: true,
        heartbeatTime: action.time,
      };
    case actionType.SET_PRODUCT_WS_DATA:
      return { ...state,
        products: state.products.map((p) => {
          const product = { ...p };
          if (p.id === action.id) {
            product.data = action.data;
          }
          return product;
        }),
      };
    case actionType.SET_ORDER_BOOK:
      // console.log('reducer/chart.js handle set orderbook',action);
      return { ...state,
        hasOrderBook: true,
        products: state.products.map(p => (
          { ...p,
            asks: p.id === action.id
              ? action.orderBook.asks.sort((a, b) => {
                  const aPrice = parseFloat(a.price);
                  const bPrice = parseFloat(b.price);
                  if (aPrice > bPrice) return -1;
                  if (aPrice < bPrice) return 1;
                  return 0;
                }).slice(action.orderBook.asks.length - maxOrderbookLength, action.orderBook.asks.length - 1)
              : p.asks,
            bids: p.id === action.id
            ? action.orderBook.bids.sort((a, b) => {
                const aPrice = parseFloat(a.price);
                const bPrice = parseFloat(b.price);
                if (aPrice > bPrice) return -1;
                if (aPrice < bPrice) return 1;
                return 0;
              }).slice(0, maxOrderbookLength)
            : p.bids,
          }
        )),
      };
    case actionType.UPDATE_ORDER_BOOK:
      // console.log('update order book reducer handler', action);
      // clone bids, then update bids with buys
      const bids = { ...state.products.find(p => {
        return p.id === action.id;
      }) }.bids.slice(0);
      // clone asks, then update asks with sells
      const asks = { ...state.products.find(p => {
        return p.id === action.id;
      }) }.asks.slice(0);

      // note: sort all data highest price to lowest price
      // todo: if new bid, and bid > lowst ask, remove lowest ask.
      //       if new ask, and ask < highest bid, remove hiest bid.
      for (let i = 0; i < action.changes.length; i +=1 ) {
        const data = { price: parseFloat(action.changes[i][1]).toFixed(2), size: parseFloat(action.changes[i][2]).toFixed(8) }

        if (action.changes[i][0] === 'buy') {
          // insert or update bids
          let index = bids.findIndex((bid) => {
              // eslint-disable-next-line
              return parseFloat(bid.price) == parseFloat(action.changes[i][1]);
          });
          if (index > -1) {
            // update bid
            // eslint-disable-next-line
            if (parseFloat(action.changes[i][2]) == 0) {
              bids.splice(index, 1);
            } else {
              bids.splice(index, 1,  { ...data });
            }
          // eslint-disable-next-line
          } else if (parseFloat(action.changes[i][2]) != 0) {
            index = bids.findIndex((bid) => {
                return parseFloat(bid.price) < parseFloat(action.changes[i][1]);
            });
            if (index === -1) index = bids.length;
            // insert bid
            bids.splice(index, 0, { ...data });
          }
        } else if (action.changes[i][0] === 'sell' ) {
          // insert or update asks
          let index = asks.findIndex((ask) => {
              // eslint-disable-next-line
              return parseFloat(ask.price) == parseFloat(action.changes[i][1]);
          });
          if (index > -1) {
            // update ask
            // console.log('update at index', index);
            // eslint-disable-next-line
            if (parseFloat(action.changes[i][2]) == 0) {
              asks.splice(index, 1);
            } else {
              asks.splice(index, 1, { ...data });
            }
            // eslint-disable-next-line
          } else if (parseFloat(action.changes[i][2]) != parseFloat(0)) {
            index = asks.findIndex((ask) => {
                return parseFloat(ask.price) < parseFloat(action.changes[i][1]);
            });
            if (index === -1) index = asks.length;
            // insert ask
            // console.log('insert at index', index);
            asks.splice(index, 0, { ...data });
          }
        } else {
          console.error('Unrecognized orderbook udpate from websocket: ', action.changes[i]);
        }
      }

      let deleteCount = asks.length - maxOrderbookLength;
      if (deleteCount > 0) asks.splice(0, deleteCount)

      if (asks[asks.length - 1].price > asks[asks.length - 2].price) {
        console.error('asks book broken', asks[asks.length - 1].price, asks[asks.length - 2].price);
        console.log('action', action);
        console.log('asks', { ...state.products.find(p => {
          return p.id === action.id;
        }) }.asks);
      }

      if (bids[1].price > bids[0].price) {
        console.error('bids book broken', bids[1].price, bids[1].price);
        console.log('action', action);
        console.log('bids', { ...state.products.find(p => {
          return p.id === action.id;
        }) }.bids);
      }

      return { ...state,
        products: state.products.map(p => (
          { ...p,
            asks: p.id === action.id
              ? asks
              : p.asks,
            bids: p.id === action.id
              ? bids.slice(0, maxOrderbookLength)
              : p.bids,
          }
        )),
      };
    case actionType.SET_TICKER_WS_DATA:
      // console.log('reducter/websocket ', action.Type, action);
      return { ...state,
        products: state.products.map(p => {
          // console.log(p, action)
          return { ...p,
            ticker: p.id === action.data.product_id
              ? { bestAsk: Number(action.data.best_ask).toFixed(2), bestBid: Number(action.data.best_bid).toFixed(2) }
              : p.ticker,
          }
        }),
      };
    case actionType.UPDATE_HEARTBEAT:
      return { ...state, connected: action.status };
    default:
      return state;
  }
};

export default websocket;
