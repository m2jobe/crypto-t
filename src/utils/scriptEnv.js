import { postLimitOrder } from './api';
import { round, floor } from './math';

// todo: pass in orderbook for the user
const buyLimit = (id) => {
  // limitOrder('buy', p.id, orderbook);
};

// todo: pass in orderbook for the user
const sellLimit = (id) => {
  // limitOrder('sell', p.id, orderbook);
};

// todo: pass in orderbook for the user
const buyMarket = (id) => {
  // limitOrder('buy', p.id, orderbook);
};

// todo: pass in orderbook for the user
const sellMarket = (id) => {
  // limitOrder('sell', p.id, orderbook);
};


const run = (props) => {
  try {
    eval(props.script);
  } catch (err) {
    console.error(`Script encountered error: ${err}`);
  }
};

export default run;
