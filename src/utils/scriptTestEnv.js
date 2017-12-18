import { round } from './math';

let orderHist;

const test = (props) => {
  const scriptWithHeader = props.header + ';' + props.script;
  const products = props.product;
  let maxGain = 0;
  let losses = [0];
  let gains = [0];
  orderHist = [];

  for (let i = 1; i < props.product.data.length - 1; i += 1) {
    const now = i;
    const lastOrder = orderHist.length > 0 ? orderHist[orderHist.length - 1] : {};
    const order = { time: props.product.data[i + 1].time, price: 0 };

    if (props.product.data[i].close > props.product.data[i].open) {
      maxGain += props.product.data[i].close - props.product.data[i].open;
    }

    try {
      const buy = (id) => {
        if (orderHist.length === 0) {
          orderHist = [...orderHist, { ...order, label: id, price: (-1) * props.product.data[i + 1].open }];
        } else if (orderHist[orderHist.length - 1].price > 0) {
          orderHist = [...orderHist, { ...order, label: id, price: (-1) * props.product.data[i + 1].open }];
        }
      };

      const sell = (id) => {
        if (orderHist.length !== 0) {
          if (orderHist[orderHist.length - 1].price) {
            if (orderHist[orderHist.length - 1].price < 0) {
              orderHist = [...orderHist, { ...order, label: id, price: props.product.data[i + 1].open }];
            }
          }
        }
      };
      eval(scriptWithHeader);
    } catch (err) {
      console.warn(`Script encountered error: ${err}`);
    }
  }

  const numTrades = orderHist.length;

  for (let i = 1; i < numTrades; i += 1) {
    const thisTrade = orderHist[i].price;
    const lastTrade = orderHist[i - 1].price;
    const tradeDiff = thisTrade + lastTrade;
    // for every sell
    if (thisTrade > 0) {
      if (tradeDiff > 0) { // gain
        gains = [...gains, tradeDiff];
        orderHist[i] = { ...orderHist[i], loss: false };
      } else if (tradeDiff < 0) { // loss
        losses = [...losses, tradeDiff];
        orderHist[i] = { ...orderHist[i], loss: true };
      }
    }
  }

  const avgLoss = round(losses.reduce((a, b) => (a + b), 0) / losses.length, 2);
  const avgGain = round(gains.reduce((a, b) => (a + b), 0) / losses.length, 2);
  const total = round(losses.reduce((a, b) => (a + b), 0) + gains.reduce((a, b) => (a + b), 0), 2);
  const range = (props.product.data[props.product.data.length - 1].time - props.product.data[0].time) / 1000;
  const rate = round((total / range) * 3600, 2);
  const baseGain = round(props.product.data[props.product.data.length - 1].open - props.product.data[1].open, 2);
  maxGain = round(maxGain, 2);
  const baseEfficiency = round((total / baseGain) * 100, 2);
  const maxEfficiency = round((total / maxGain) * 100, 2);

  const result = {
    avgLoss,
    avgGain,
    avgTrade: round(avgGain + avgLoss, 2),
    baseGain,
    data: orderHist,
    numTrades,
    rate, // dollars per hour per coin
    total,
  };

  console.log(`Test Results ${props.product.label}:
    Gain: ${avgGain} [ % / trade ]
    Loss: ${avgLoss} [ % / trade ]
    Rate: ${rate} [ $ / hr / coin ]
    Total Gain: ${total} [ $ ]
    Base Gain: ${baseGain} [ $ ]
    Max Gain: ${maxGain} [ $ ]
    η(base): ${total > 0 && baseGain > 0 ? baseEfficiency : '—'} [ % ],
    η(max): ${total > 0 && maxGain > 0 ? maxEfficiency : '—'} [ % ]`,
  );
  return result;
};

export default test;
