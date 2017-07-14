// react/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import createHistory from 'history/createBrowserHistory';
import thunkMiddleware from 'redux-thunk';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import ReactGA from 'react-ga';

import Reducers from './reducers';
import { checkSession, fetchCart, fetchCarts, fetchInvoiceByCart, fetchStores, fetchMetrics, fetchCategories, submitQuery, updateQuery } from './actions';
import { AppContainer } from './containers';

if (module.hot && (!process.env.BUILD_MODE || !process.env.BUILD_MODE.includes('prebuilt')) && (!process.env.NODE_ENV || !process.env.NODE_ENV.includes('production'))) {
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
    timestamp: false,
    level: { // redux dev tools can do all of this without cluttering the console
      // download! http://extension.remotedev.io/
      prevState: false,
      action: 'error',
      nextState: false,
      error: 'error'
    },
    predicate: (_, action) => action.error // only logs messages with errors
  });
  middleware = [...middleware, loggerMiddleware];
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; //apparently we should use in production? there's a bunch of posts (also it only loads if you have redux devtools)

const store = createStore(Reducers, composeEnhancers(applyMiddleware(...middleware)));

// Basically our initialization sequence
// Check session
// Fetch everything required for the app to not break
// Fetch Metrics
const cart_id = location.pathname.match(/cart\/(\w*)\/?/),
  search = location.search.match(/q=([^&$]+)/);

store.dispatch(checkSession()).then(() => {
  store.dispatch(fetchStores());
  if (cart_id && cart_id[1]) {
    store.dispatch(fetchInvoiceByCart(cart_id[1]));
    store.dispatch(fetchCart(cart_id[1]))
      .then((res) => {
        store.dispatch(fetchCategories(cart_id[1]));
        if (search && search[1]) {
          store.dispatch(updateQuery(decodeURIComponent(search[1])));
          store.dispatch(submitQuery(decodeURIComponent(search[1]), res.response.store, res.response.store_locale));
        }
      }).then(() => {
        store.dispatch(fetchMetrics(cart_id[1]));
        store.dispatch(fetchCarts());
      });
  } else {
    store.dispatch(fetchCarts());
  }
});

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Route path="*" component={AppContainer} />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
