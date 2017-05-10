// kip-website/index.js

import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import thunkMiddleware from 'redux-thunk';
import { Route } from 'react-router';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import Reducers from './reducers';
import { get } from './actions';
import { App } from './components';

if (module.hot) {
  module.hot.accept();
}

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

const history = createHistory();
const historyMiddleware = routerMiddleware(history);
const store = createStore(
  Reducers,
  applyMiddleware(...middleware)
);

// Check the session?? i guess
store.dispatch(get('/api/session', 'SESSION'))
  .then(() => {
    store.dispatch(get('/api/carts', 'CARTS'))
  });

// Configure View
ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
          <Route path="/" component={App}/>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
