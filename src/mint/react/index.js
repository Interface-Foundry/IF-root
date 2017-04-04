import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import createHistory from 'history/createBrowserHistory';
import thunkMiddleware from 'redux-thunk';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';

import Reducers from './reducers';
import { session } from './actions';
import { AppContainer } from './containers';

import 'whatwg-fetch';

if (module.hot) {
  module.hot.accept();
}

const history = createHistory();
const historyMiddleware = routerMiddleware(history);

// creating redux store
const store = createStore(
  Reducers,
  applyMiddleware(thunkMiddleware),
  applyMiddleware(historyMiddleware)
);

// update login status
store.dispatch(session.update());

ReactDOM.render(
  <Provider store={store}>
   <ConnectedRouter history={history}>
       <Route path="/" component={AppContainer} />
   </ConnectedRouter>
 </Provider>,
  document.getElementById('root')
);
