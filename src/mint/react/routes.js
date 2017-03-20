// react/routes.js
// handles choosing which route to render
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import { Route, Switch } from 'react-router';
import thunkMiddleware from 'redux-thunk';
import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux';

import App from './containers/App';
import * as reducers from './reducers';
import {session} from './actions';

const history = createHistory();
const historyMiddleware = routerMiddleware(history);

// creating redux store
const store = createStore(
  combineReducers({
    ...reducers,
    routing: routerReducer
  }),
  applyMiddleware(thunkMiddleware),
  applyMiddleware(historyMiddleware)
);

// update session
store.dispatch(session.update()).then(() => console.log('set session', store.getState()));

const Routes = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/cart/:cart_id" component={ App }/>
        <Route path="*" status={404}/>
      </Switch>
    </ConnectedRouter>
  </Provider>
);

export default Routes;
