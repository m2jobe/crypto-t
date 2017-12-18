import * as actionType from '../actions/actionTypes';

const INITAL_PROFILE_STATE = {
  session: '',
  live: false,
  products: [
    { label: 'BTC/USD', id: 'BTC-USD', active: true },
    { label: 'LTC/USD', id: 'LTC-USD', active: false },
    { label: 'ETH/USD', id: 'ETH-USD', active: false },
  ],
  accounts: [{ available: 0, balance: 0, currency: 'USD' }],
  orders: [],
  activeOrders: [],
  fills: [],
};

const profile = (state = INITAL_PROFILE_STATE, action) => {
  let activeOrders;
  let orders;
  let fills;
  switch (action.type) {
    case actionType.SELECT_PRODUCT:
      // console.log(action);
      return { ...state,
        products: state.products.map(p => (
          { ...p, active: p.id === action.id }
        )),
      };
    case actionType.SET_FILLS:
      fills = { ...state.fills };
      fills[action.productId] = action.fills;
      return { ...state, fills };
    case actionType.SET_ORDERS:
      // console.log(action);
      orders = { ...state.orders };
      orders[action.product] = action.orders;
      return { ...state, orders };
    case actionType.SET_CANCELLING:
      // console.log(action, state);
      orders = { ...state.orders };
      let ordersForProduct = orders[action.productId];
      if (ordersForProduct) {
        ordersForProduct = ordersForProduct.map(o => {
          const order = { ...o };
          if (order.id === action.orderId) {
            order.cancelling = true;
          }
          return order;
        });
        // console.log('ordersForProduct', ordersForProduct);
      }
      orders[action.productId] = ordersForProduct;
      // console.log('new orders for product', ordersForProduct);
      return { ...state,  orders};
    case actionType.ADD_ACTIVE_ORDER:
      // console.log(state, action);
      activeOrders = { ...state.activeOrders };
      if (state.activeOrders[action.productId]) {
        activeOrders[action.productId] = [ ...activeOrders[action.productId], action.order ];
      } else {
        activeOrders[action.productId] = [ action.order ];
      }
      // console.log('profile reducer, add act order.', activeOrders);
      return { ...state, activeOrders };
    case actionType.DELETE_ACTIVE_ORDER:
      // console.log(action, state);
      activeOrders = { ...state.activeOrders };
      const activeOrdersForProduct = state.activeOrders[action.productId];
      if (activeOrdersForProduct) {
        // console.log('activeOrdersForProduct', activeOrdersForProduct);
        const index = activeOrdersForProduct.findIndex(o => {
          // console.log('finding order with id', action.orderId, o);
          return o.id === action.orderId
        });
        // console.log('order index to be deleted', index);
        if (index > -1) {
          activeOrdersForProduct.splice(index, 1);
        }
      }
      activeOrders[action.productId] = activeOrdersForProduct;
      // console.log('new active orders', activeOrders);
      return { ...state,  activeOrders};
    case actionType.IMPORT_PROFILE:
      return { ...state, ...action.userData.profile };
    case actionType.SAVE_PROFILE:
      return { ...state, ...action.settings };
    case actionType.SAVE_SESSION:
      return { ...state, session: action.session };
    case actionType.UPDATE_ACCOUNTS:
      if (action.accounts) {
        return { ...state, accounts: action.accounts };
      }
      return state;
    default:
      return state;
  }
};

export default profile;
