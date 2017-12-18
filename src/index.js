import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import 'react-select/dist/react-select.css';
import 'react-toggle-switch/dist/css/switch.min.css';
import 'font-awesome/scss/font-awesome.scss';
import App from './App';
import reducer from './reducers';
import './styles/styles.scss';
import { INIT_CHART_STATE } from './reducers/chart';
import { INIT_WEBSOCKET_STATE } from './reducers/websocket';

const composeEnhancers = typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const getComposeEnhancers = () => {
  if (window.navigator.userAgent.includes('Chrome')) {
    return composeEnhancers(
      applyMiddleware(thunk),
    );
  }
  return compose(applyMiddleware(thunk));
};

const localStorageName = 'decentrav0.0.01'

const localStorageState = () => {
  const local = JSON.parse(localStorage.getItem(localStorageName))
  return typeof local === 'object' ? JSON.parse(localStorage.getItem(localStorageName)) : null;
}

const initialState = () => {
  // merge locally saved state with missing state slices.
  if (localStorageState === null) {
    return null;
  }

  const initState = {
    ...localStorageState(),
    chart : INIT_CHART_STATE,
    websocket: INIT_WEBSOCKET_STATE,
  }
  // console.log('initstate', initState);
  return initState;
}

const store = createStore(
  reducer,
  initialState(),
  getComposeEnhancers(),
);

let lastState = initialState();

store.subscribe(function () {
  const state = store.getState();
  // console.log('state length', JSON.stringify(state).length);
  try {
    const writenState = JSON.stringify({ ...state,
      chart: null,
      websocket: null,
    });
    if (writenState !== lastState) {
       // console.log('Writing new state to localStorage with length: ',writenState.length);
       localStorage.setItem(localStorageName, writenState);
       lastState = writenState;
    }
  } catch (e) {
    console.warn('Unable to persist state to localStorage:', e);
  }
});

render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
);
