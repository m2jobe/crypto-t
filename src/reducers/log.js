import * as actionType from '../actions/actionTypes';

const INITAL_LOG_STATE = [
  {
    time: new Date().getTime(),
    message: 'Welcome!',
  },
];

const log = (state = INITAL_LOG_STATE, action) => {
  switch (action.type) {
    case actionType.APPEND_LOG:
      return [{
        message: typeof action.log === 'object' ? JSON.stringify(action.log) : action.log,
        time: new Date().getTime(),
      }, ...state];
    case actionType.CLEAR_LOG:
      return [];
    default:
      return state;
  }
};

export default log;
