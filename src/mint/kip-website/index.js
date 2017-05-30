// kip-website/index.js

import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { Route } from 'react-router-dom';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import Reducers from './reducers';
import { get, getSiteState } from './actions';
import { AppContainer } from './containers';

if (module.hot) {
  module.hot.accept();
}

const history = createHistory();
const historyMiddleware = routerMiddleware(history);

let middleware = [thunkMiddleware, historyMiddleware];
if (!process.env.NODE_ENV || !process.env.NODE_ENV.includes('production')) {
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

// Check session and prep carts and blogs
store.dispatch(getSiteState())
  .then(() => store.dispatch(get('/api/session', 'SESSION')))
  .then(() => Promise.all([store.dispatch(get('/api/carts', 'CARTS')), store.dispatch(get('api/blog/posts', 'POSTS'))]));

// Configure View
ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Route path="/" component={AppContainer}/>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);