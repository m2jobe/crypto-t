import * as actionType from '../actions/actionTypes';

const INITAL_LOCATION = {};

const location = (state = INITAL_LOCATION, action) => {
  switch (action.type) {
    case actionType.SET_LOCATION:
      return { ...action.location };
    default:
      return state;
  }
};

export default location;
