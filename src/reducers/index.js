import { combineReducers } from 'redux';
import chart from './chart';
import profile from './profile';
import scripts from './scripts';
import log from './log';
import websocket from './websocket';
import location from './location';
import view from './view';

const reducer = combineReducers({
  chart,
  profile,
  scripts,
  log,
  websocket,
  location,
  view,
});

export default reducer;
