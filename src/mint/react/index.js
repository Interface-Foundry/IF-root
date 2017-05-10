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
import { session } from './actions';
import { AppContainer } from './containers';

//Analytics!
import ReactGA from 'react-ga';

import 'whatwg-fetch';

if (module.hot) {
  module.hot.accept();
}

let middleware;
if (!process.env.NODE_ENV || !process.env.NODE_ENV.includes('production')) {
  const ReduxLogger = require('redux-logger');
  const loggerMiddleware = ReduxLogger.createLogger({
    duration: true,
    timestamp: false,
    collapsed: true,
    level: 'info'
  });
  middleware = applyMiddleware(thunkMiddleware, historyMiddleware, loggerMiddleware);
} else {
  middleware = applyMiddleware(thunkMiddleware, historyMiddleware);
}

const history = createHistory();
history.listen((location, action) => {
  ReactGA.set({ path: location.pathname });
  ReactGA.pageview(location.pathname);
});
const historyMiddleware = routerMiddleware(history);
const store = createStore(
  Reducers,
  middleware
);

// update login status
store.dispatch(session.update());

ReactDOM.render(
  <Provider store={store}>
   <ConnectedRouter history={history}>
       <Route path="*" component={AppContainer} />
   </ConnectedRouter>
 </Provider>,
  document.getElementById('root')
);
