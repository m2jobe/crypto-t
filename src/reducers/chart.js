import * as actionType from '../actions/actionTypes';
import calculateIndicators from '../utils/indicators';
import { INIT_RANGE, INIT_GRANULARITY } from '../utils/constants';

export const INIT_CHART_STATE = {
  indicators: [{
    name: 'Stoch RSI',
    id: 'srsi',
    params: {
      rsiPeriod: 14,
      stochPeriod: 14,
      kPeriod: 3,
      dPeriod: 3,
    },
    chartMin: 0,
    chartMax: 1,
    axisLines: [0.8, 0.2],
    renderOnMain: false,
    valueIds: ['K', 'D'],
    active: false,
  },
  {
    name: 'CCI',
    id: 'cci',
    params: {
      period: 20,
    },
    chartMin: -400,
    chartMax: 400,
    axisLines: [100, -100],
    renderOnMain: false,
    valueIds: ['CCI'],
    active: false,
  },
  {
    name: 'RSI',
    id: 'RSI',
    params: {
      period: 14,
    },
    chartMin: 0,
    chartMax: 100,
    axisLines: [70, 30],
    renderOnMain: false,
    valueIds: ['RSI'],
    active: false,
  },
  {
    name: 'SMA',
    id: 'SMA',
    params: {
      period: 8,
    },
    renderOnMain: true,
    valueIds: ['SMA'],
    active: false,
  },
  {
    name: 'EMA',
    id: 'EMA',
    params: {
      period: 8,
    },
    renderOnMain: true,
    valueIds: ['EMA'],
    active: false,
  },
  {
    name: 'WMA',
    id: 'WMA',
    params: {
      period: 8,
    },
    renderOnMain: true,
    valueIds: ['WMA'],
    active: false,
  },
  {
    name: 'MACD',
    id: 'MACD',
    params: {
      fastPeriod: 5,
      slowPeriod: 8,
      signalPeriod: 3,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    },
    renderOnMain: false,
    valueIds: [
      'MACD',
      'histogram',
      'signal',
    ],
    active: false,
  },
  {
    name: 'BB',
    id: 'BollingerBands',
    params: {
      period: 8,
      stdDev: 2,
    },
    renderOnMain: true,
    valueIds: [
      'lower',
      'middle',
      'upper',
    ],
    active: false,
  },
  {
    name: 'ATR',
    id: 'ATR',
    params: {
      period: 14,
    },
    renderOnMain: false,
    valueIds: [
      'ATR',
    ],
    active: false,
  },
  {
    name: 'WEMA',
    id: 'WEMA',
    params: {
      period: 5,
    },
    renderOnMain: true,
    valueIds: [
      'WEMA',
    ],
    active: false,
  },
  {
    name: 'ROC',
    id: 'ROC',
    params: {
      period: 12,
    },
    renderOnMain: false,
    valueIds: [
      'ROC',
    ],
    active: false,
  },
  {
    name: 'KST',
    id: 'KST',
    params: {
      ROCPer1: 10,
      ROCPer2: 15,
      ROCPer3: 20,
      ROCPer4: 30,
      SMAROCPer1: 10,
      SMAROCPer2: 10,
      SMAROCPer3: 10,
      SMAROCPer4: 15,
      signalPeriod: 3,
    },
    renderOnMain: false,
    valueIds: [
      'kst',
      'signal',
    ],
    active: false,
  },
  {
    name: 'Stochastic',
    id: 'Stochastic',
    params: {
      period: 14,
      signalPeriod: 3,
    },
    renderOnMain: false,
    valueIds: [
      'k',
      'd',
    ],
    axisLines: [80, 20],
    active: false,
  },
  {
    name: 'Williams %R',
    id: 'WilliamsR',
    params: {
      period: 14,
    },
    renderOnMain: false,
    valueIds: [
      'WilliamsR',
    ],
    axisLines: [-20, -80],
    active: false,
  },
  {
    name: 'ADL',
    id: 'ADL',
    renderOnMain: false,
    valueIds: [
      'ADL',
    ],
    active: false,
  },
  {
    name: 'OBV',
    id: 'OBV',
    renderOnMain: false,
    valueIds: [
      'OBV',
    ],
    active: false,
  },
  {
    name: 'TRIX',
    id: 'TRIX',
    params: {
      period: 18,
    },
    renderOnMain: false,
    valueIds: [
      'TRIX',
    ],
    active: false,
  },
  {
    name: 'ADX',
    id: 'ADX',
    params: {
      period: 14,
    },
    renderOnMain: false,
    valueIds: [
      'ADX',
    ],
    active: false,
  }],
  dateRanges: [
    { label: '1 minute', value: 1 },
    { label: '5 minutes', value: 5 },
    { label: '10 minute', value: 10 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '3 hours', value: 180 },
    { label: '6 hours', value: 360 },
    { label: '1 day', value: 1440 },
    { label: '5 days', value: 7200 },
    { label: '10 days', value: 14400 },
    { label: '1 Month', value: 43200 },
    { label: '3 Months', value: 129600 },
    { label: '6 Months', value: 259200 },
    { label: '1 Year', value: 518400 },
  ],
  products: [],
  testResult: {},
  fetchingStatus: 'success',
};

const chart = (state = INIT_CHART_STATE, action) => {
  switch (action.type) {
    case actionType.SET_FETCHING_STATUS:
      return { ...state, fetchingStatus: action.status };
    case actionType.SAVE_TEST_RESULT:
      return { ...state, testResult: action.result };
    case actionType.SELECT_INDICATOR:
      return { ...state,
        indicators: state.indicators.map(i => (
          { ...i, active: i.id === action.id ? !i.active : i.active }
        )),
      };
    case actionType.EDIT_INDICATOR:
      return { ...state,
        indicators: state.indicators.map(i => (
          i.id === action.indicator.id ? action.indicator : i
        )),
      };
    case actionType.SELECT_DATE_RANGE:
      return { ...state,
        products: state.products.map(p => (
          { ...p,
            range: p.id === action.id ? action.range : p.range,
          }
        )),
      };
    case actionType.SET_GRANULARITY:
      return { ...state,
        products: state.products.map(p => (
          { ...p,
            granularity: p.id === action.id ? parseInt(action.granularity, 10) : p.granularity,
          }
        )),
      };
    case actionType.SET_PRODUCTS:
      return { ...state,
        products: action.products.map(product => (
          { ...product, granularity: INIT_GRANULARITY, range: INIT_RANGE, data: [], docSelected: false, bids: [], asks: [] }
        )),
      };
    case actionType.SET_PRODUCT_DATA:
      // console.log(action);
      return { ...state,
        products: state.products.map((p) => {
          const product = { ...p };
          if (product.id === action.id && action.data) {
            let data = [...action.data.data];
            const endDate = action.data.epochEnd * 1000;
            const startDate = endDate - (product.range * 60000); // (minutes * ( ms / minute)*1000)
            const dates = [];
            let lastTime = 0;

            data = data.sort((a, b) => {
              if (a.time < b.time) return -1;
              if (a.time > b.time) return 1;
              return 0;
            }).filter((d) => {
              const isDupe = dates.indexOf(d.time) > 0;
              const isInTimeRange = d.time >= startDate && d.time <= endDate;
              dates.push(d.time);
              if (d.time - lastTime >= product.granularity * 1000) {
                lastTime = d.time;
                return true && !isDupe && isInTimeRange;
              }
              return false;
            });
            const inds = calculateIndicators(state.indicators, data);
            return { ...product,
              data,
              ...inds,
            };
          }
          return product;
        }),
      };
    case actionType.ADD_PRODUCT_DATA:
      // console.log(action);
      return { ...state,
        products: state.products.map((p) => {
          const product = { ...p };
          if (product.id === action.id) {
            const data = [...product.data, action.data];
            const inds = calculateIndicators(state.indicators, data);
            return { ...product,
              data,
              ...inds,
            };
          }
          return product;
        }),
      };
    case actionType.CALCULATE_INDICATORS:
      return { ...state,
        products: state.products.map((p) => {
          const product = { ...p };
          if (product.id === action.id) {
            const inds = calculateIndicators(state.indicators, [...product.data]);
            return { ...product, ...inds };
          }
          return product;
        }),
      };
    case actionType.IMPORT_PROFILE:
      return { ...state,
        indicators: action.userData.indicators,
        products: state.products.map((p) => {
          for (let i = 0; i < action.userData.products.length; i += 1) {
            if (action.userData.products[i].id === p.id) {
              return ({ ...p,
                id: action.userData.products[i].id,
                granularity: action.userData.products[i].granularity,
                range: action.userData.products[i].range,
                docSelected: action.userData.products[i].docSelected,
                active: action.userData.products[i].active,
              });
            }
          }
          return p;
        }),
      };
    default:
      return state;
  }
};

export default chart;
