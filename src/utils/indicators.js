import * as Indicators from 'technicalindicators';

// supply additional params by indicator type
const indParams = (type, data) => {
  const hlc = ['ATR', 'Stochastic', 'WilliamsR', 'ADX'];
  const cv = ['OBV'];
  const hlcv = ['ADL'];

  if (hlc.includes(type)) {
    return {
      high: data.map(d => (d.high)),
      low: data.map(d => (d.low)),
      close: data.map(d => (d.close)),
    };
  }
  if (hlcv.includes(type)) {
    return {
      high: data.map(d => (d.high)),
      low: data.map(d => (d.low)),
      close: data.map(d => (d.close)),
      volume: data.map(d => (d.volume)),
    };
  }
  if (cv.includes(type)) {
    return {
      close: data.map(d => (d.close)),
      volume: data.map(d => (d.volume)),
    };
  }
  return { values: data.map(d => (d.close)) };
};

// format indicator output
const indFormatter = (type, ind) => {
  if (typeof ind[0] === 'object') {
    return ind.map(d => (
      { ...d }
    ));
  }
  return ind.map((d) => {
    const o = {};
    o[type] = d;
    return o;
  });
};

// add dates to indicator data points
const indDater = (ind, data) => {
  let indicator = ind;
  const offset = data.length - ind.length;
  const padding = data.slice(0, offset).map(d => (
    { time: d.time }
  ));
  indicator = [...padding, ...indicator];
  for (let i = offset; i < data.length; i += 1) {
    indicator[i].time = data[i].time;
  }
  return indicator;
};

// generate indicator data from technicalindicators lib
const technicalIndicatorsConverter = (type, data, params) => {
  const ind = {};
  ind[type] = indDater(
    indFormatter(type, Indicators[type].calculate(
      { ...indParams(type, data),
        ...params,
      },
    ),
  ), data);
  return ind;
};

// TODO: Add to technicalindicators lib
const stochRSI = (data, rsiPeriod, stochPeriod, kPeriod, dPeriod) => {
  let rsi = [];
  let srsi = [];

  if (data[0]) {
    rsi = [...rsi, { time: data[0].time }];
    srsi = [...srsi, { time: data[0].time }];
  }

  for (let i = 1; i < data.length; i += 1) {
    let gain = 0;
    let loss = 0;
    let sumGains = 0;
    let sumLosses = 0;
    const close = data[i].close;
    const time = data[i].time;
    rsi = [...rsi, { time }];
    srsi = [...srsi, { time }];
    // RSI, Averageing is EMA
    if (close > data[i - 1].close) {
      gain = close - data[i - 1].close;
    } else if (close < data[i - 1].close) {
      loss = data[i - 1].close - close;
    }
    rsi[i] = { ...rsi[i], gain, loss };
    if (i >= rsiPeriod) {
      // set initial average values
      if (i === rsiPeriod) {
        // get sum of gains values in rsiLength
        for (let j = 0; j < rsiPeriod; j += 1) {
          sumGains += rsi[i - j].gain;
          sumLosses += rsi[i - j].loss;
        }
        const avgGain = sumGains / rsiPeriod;
        const avgLoss = sumLosses / rsiPeriod;
        rsi[i] = { ...rsi[i], avgGain, avgLoss, value: 100 - (100 / (((avgGain / avgLoss) + 1))) };
      } else {
        const lastAvgGain = rsi[i - 1].avgGain;
        const lastAvgLoss = rsi[i - 1].avgLoss;
        const currentGain = rsi[i].gain;
        const currentLoss = rsi[i].loss;
        const avgGain = ((lastAvgGain * (rsiPeriod - 1)) + currentGain) / rsiPeriod;
        const avgLoss = ((lastAvgLoss * (rsiPeriod - 1)) + currentLoss) / rsiPeriod;
        const rs = avgGain / avgLoss;
        rsi[i] = { ...rsi[i], avgGain, avgLoss, value: 100 - (100 / (rs + 1)) };
      }
      // StochRSI
      if (i >= rsiPeriod + stochPeriod) {
        let minRSI = rsi[i].value;
        let maxRSI = minRSI;
        // iterate through last 14 data to get min and max rsi
        for (let j = 0; j < stochPeriod; j += 1) {
          const newRSI = rsi[i - j].value;
          minRSI = Math.min(newRSI, minRSI);
          maxRSI = Math.max(newRSI, maxRSI);
        }
        srsi[i] = { ...srsi[i], stoch: (rsi[i].value - minRSI) / (maxRSI - minRSI) };
      }
      if (i >= rsiPeriod + stochPeriod + kPeriod) {
        let sumStoch = 0;
        for (let j = 0; j < kPeriod; j += 1) {
          sumStoch += srsi[i - j].stoch;
        }
        srsi[i] = { ...srsi[i], K: sumStoch / kPeriod };
      }
      if (i >= rsiPeriod + stochPeriod + kPeriod + dPeriod) {
        let sumK = 0;
        for (let j = 0; j < dPeriod; j += 1) {
          sumK += srsi[i - j].K;
        }
        srsi[i] = { ...srsi[i], D: sumK / dPeriod };
      }
    }
  }
  return { srsi };
};

// TODO: Remove after technicalindicators npm version has this indicator
const commodityChannelIndex = (data, params) => {
  const period = params.period;
  let cci = [];
  if (data[0]) {
    cci = [...cci, { time: data[0].time }];
  }

  for (let i = 1; i < data.length; i += 1) {
    cci = [...cci, { price: data[i].close, time: data[i].time }];
    if (i >= period) {
      // reset values for moving average and standard deviation
      let priceMovingAverage = 0;
      let priceAverageDeviation = 0;
      // set moving average
      if (i > period - 1) {
          // sum of last cciLength days closing price
          // i > 13  -> i >=14 when this block executes
        for (let j = 0; j < period; j += 1) {
              // 14 - 0 -> 14 - 14 === 14 -> 0
          priceMovingAverage += cci[i - j].price;
        }
          // divide by length to get averaage
        priceMovingAverage /= period;
          // set average deviation
        for (let j = 0; j < period; j += 1) {
          priceAverageDeviation += Math.abs(cci[i - j].price - priceMovingAverage);
        }
        priceAverageDeviation /= period;
        cci[i].CCI = (cci[i].price - priceMovingAverage) / (0.015 * priceAverageDeviation);
      }
    }
  }
  return { cci };

  // TODO: enable this when its up on NPM
  // const cci = Indicators.CCI.calculate({
  //   open: data.map(d => (d.open)),
  //   high: data.map(d => (d.high)),
  //   low: data.map(d => (d.low)),
  //   close: data.map(d => (d.close)),
  //   ...params,
  // }).map(d => (
  //   { CCI: d }
  // ));
  // const offset = data.length - cci.length;
  // for (let i = 0; i < cci.length; i += 1) {
  //   cci[i].time = data[i + offset].time;
  // }
  // return { cci };
};

const calculateIndicators = (indicators, data) => {
  let indicatorData = {};
  for (let i = 0; i < indicators.length; i += 1) {
    switch (indicators[i].id) {
      case 'srsi':
        indicatorData = {
          ...indicatorData,
          ...stochRSI(
            data,
            indicators[i].params.rsiPeriod,
            indicators[i].params.stochPeriod,
            indicators[i].params.kPeriod,
            indicators[i].params.dPeriod,
          ),
        };
        break;
      case 'cci':
        indicatorData = {
          ...indicatorData,
          ...commodityChannelIndex(data, indicators[i].params),
        };
        break;
      default:
        indicatorData = {
          ...indicatorData,
          ...technicalIndicatorsConverter(indicators[i].id, data, indicators[i].params),
        };
        break;
    }
  }
  return indicatorData;
};

export default calculateIndicators;
