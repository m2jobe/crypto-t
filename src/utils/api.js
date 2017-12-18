import axios from 'axios';
import moment from 'moment';
import {  toast } from 'react-toastify';

// import { floor } from './math';

axios.defaults.baseURL = 'https://api.gdax.com';

const handleError = (error, setFetchingStatus) => {
  toast.info('handling err');
  if (setFetchingStatus) setFetchingStatus(false);
  return toast.warn(error);
};

const authRequest = (uri, params, method, body, session) => {
  const headers = { 'CB-SESSION': session };
  const options = { method, headers, url: uri + params, data: body };
  return axios(options);
};

/*
 * Private Endpoints
*/

export const getOrder = (orderId, session) => {
  const uri = `/orders/${orderId}`;
  return authRequest(uri, '', 'get', '', session).then(res => (
    res.data
  )).catch((error) => {
    if (error.response.status >= 400) {
      toast.warn(`Find order failed ${orderId}`);
    }
  });
};

export const getOrders = (product, session) => {
  const uri = `/orders?product_id=${product}`
  return authRequest(uri, '', 'get', '', session).then(res => (
    res.data
  )).catch((error) => {
    if (error.response.status >= 400) {
      toast.warn(`Find orders failed. Product: ${product}`);
    }
  });
}

export const getAccounts = (session) => {
  const uri = '/accounts';
  return authRequest(uri, '', 'get', '', session).then(res => (
    res.data
  )).catch((err) => { toast.warn('Get accounts failed', err); });
};

export const deleteOrder = (orderId, session) => {
  const uri = `/orders/${orderId}`;
  return authRequest(uri, '', 'delete', '', session).then(res => {
    // toast.info('cancel order res', res);
    return res.data;
  }).catch((err) => { toast.warn('Cancel order failed.', orderId, err); });
}

export const getFills = (productId, session) => {
  const uri = `/fills?product_id=${productId}`;
  return authRequest(uri, '', 'get', '', session).then(res => (
    res.data
  )).catch((err) => { toast.warn('Get fills failed', err); });
}

/*
 * Public Endpoints
*/

export const serverTime = () => {
  const url = '/time';
  return axios.get(url).then(res => (
    res.data
  )).catch(handleError);
};

export const getHistorialData = (product, startDate, endDate, gran) => {
  const granularity = Math.ceil(gran);
  const url = `/products/${product}/candles?start=${startDate}&end=${endDate}&granularity=${granularity}`;
  return axios.get(url).then(res => (
    res.data.map(d => (
      {
        time: d[0] * 1000,
        low: d[1],
        high: d[2],
        open: d[3],
        close: d[4],
        volume: d[5],
      }
    ))
  ));
};

// GDAX doesnt like handling large requests to if the requested range is too big to be
// served in a single response, split up into multiple requests
// GDAX also has a burst request limit so it is important to not initialize the app a rage so wide
// that it needs to split the requests
// granularity == 300000 = 30s => I want a data point ever 30s
export const tryGetHistoricalData = (productId, time, range, desiredGranularity) => {
  // toast.info('time', time)
  let rateConstant;
  let requests = [];
  const epochEnd = time.epoch;
  const epochDiff = range * 60; // ( minutes * (seconds / minute ) )
  const maxConcurrentRequests = 10;

  if (productId.includes('LTC')) {
    rateConstant = 400;
  } else if (productId.includes('BTC')) {
    rateConstant = 350;
  } else if (productId.includes('ETH')) {
    rateConstant = 350;
  }

  // ms * (ms / trade)^-1 => trade?
  //  toast.info(epochDiff) // minutes
  const minGranularityIfSingleRequest = Math.ceil(epochDiff / rateConstant);
  const numRequsts = Math.ceil(minGranularityIfSingleRequest / desiredGranularity);
  const epochStep = Math.ceil(epochDiff / numRequsts);

  if (numRequsts <= maxConcurrentRequests) {
    for (let i = 0; i < numRequsts; i += 1) {
      const nStart = moment.unix(epochEnd - epochStep - (epochStep * i)).toISOString();
      const nEnd = moment.unix(epochEnd - (epochStep * i)).toISOString();
      const request = getHistorialData(productId, nStart, nEnd, desiredGranularity);
      requests = [...requests, request];
    }
    return axios.all(requests).then(
      axios.spread((...d) => (
        {
          epochEnd,
          data: d.reduce((a, b) => ([...a, ...b]), []),
        }
    ))).catch(err => (
      handleError(err)
    ));
  }
  return new Promise((resolve, reject) => (
    reject('Ganularity too small!')
  ));
};

export const fetchProductData = (id, range, granularity, setProductData, setFetchingStatus) => {
  setFetchingStatus(true);
  serverTime().then((time) => {
    if (time) {
      tryGetHistoricalData(id, time, range, granularity, setFetchingStatus).then((data) => {
        setFetchingStatus(false);
        setProductData(id, data);
      }).catch((err) => {
        setFetchingStatus(false);
        alert(err);
      });
    }
    setFetchingStatus(false);
  });
};

export const getProductData = (id, range, granularity) => (
  serverTime().then(time => (
    tryGetHistoricalData(id, time, range, granularity).then(data => (
      data
    ))
  ))
);

export const getProducts = () => {
  const url = '/products';
  return axios.get(url);
};

export const postMarketOrder = (side, productId, price, session) => {
  const uri = '/orders';
  const body = {
    type: 'market',
    side,
    product_id: productId,
    price,
  };
  return authRequest(uri, '', 'post', body, session).then((res) => {
    const data = res.data;
    return data;
  }).catch((error) => {
    if (error.response) {
      // human readable error
        toast.info(`Order Error: ${error.response.data.message}`);
    } else {
      toast.info('Error', error);
    }
  });
}

export const postLimitOrder = (side, productId, price, size, session) => {
  const uri = '/orders';
  const body = {
    type: 'limit',
    side,
    product_id: productId,
    price,
    size,
    time_in_force: 'GTC',
    post_only: true,
  };
  return authRequest(uri, '', 'post', body, session).then((res) => {
    const data = res.data;
    return data;
  }).catch((error) => {
    if (error.response) {
      // human readable error
      toast.info(`Order Error: ${error.response.data.message}`);
      if(error.response.data.message === "CB-ACCESS-KEY header is required") {
        toast.error(`Please ensure that your session is set in the profile page`);
      }
    } else {
      toast.info('Error', error);
    }
  });
};
