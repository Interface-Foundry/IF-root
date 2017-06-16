// react/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import createHistory from 'history/createBrowserHistory';
import thunkMiddleware from 'redux-thunk';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';

import Reducers from './reducers';
import { checkSession, fetchCart, fetchCarts, fetchStores, fetchMetrics, fetchCategories } from './actions';
import { AppContainer } from './containers';

//Analytics!
import ReactGA from 'react-ga';

// import 'whatwg-fetch';
if (module.hot
  && (!process.env.BUILD_MODE || !process.env.BUILD_MODE.includes('prebuilt'))
  && (!process.env.NODE_ENV || !process.env.NODE_ENV.includes('production'))) {
  module.hot.accept();
}

const history = createHistory();
history.listen((location, action) => {
  ReactGA.set({ path: location.pathname });
  ReactGA.pageview(location.pathname);
});
const historyMiddleware = routerMiddleware(history);
let middleware = [thunkMiddleware, historyMiddleware];
if (!process.env.NODE_ENV || !process.env.NODE_ENV.includes('production')) {
  const { createLogger } = require('redux-logger');
  const loggerMiddleware = createLogger({
    duration: true,
    timestamp: false,
    collapsed: true,
    level: 'info'
  });
  middleware = [...middleware, loggerMiddleware];
}

const store = createStore(
  Reducers,
  applyMiddleware(...middleware)
);

// Basically our initialization sequence
// Check session
// Fetch everything required for the app to not break
// Fetch Metrics
const cart_id = location.pathname.split('/')[2];

store.dispatch(checkSession()).then(() => {
  store.dispatch(fetchStores());
  store.dispatch(fetchCategories(cart_id));

  store.dispatch(fetchCart(cart_id)).then(() => {
    store.dispatch(fetchMetrics(cart_id));
    store.dispatch(fetchCarts());
  });
});

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Route path="*" component={AppContainer} />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
