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

// pages
import App from './containers/App';
import NotFound from './pages/NotFound';

// actions
import { fetchUser } from './actions';

// reducers
import UserReducer from './reducers/user';

// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory();

// Build the middleware for intercepting and dispatching navigation actions
const historyMiddleware = routerMiddleware(history);

// Add the reducer to your store on the `router` key
// Also apply our middleware for navigating
const store = createStore(
  combineReducers({
    UserReducer,
    router: routerReducer
  }),
  applyMiddleware(historyMiddleware, thunkMiddleware)
);

store.dispatch(fetchUser()).then(() =>
  console.log(store.getState())
);

const Routes = () => (
  <Provider store={store}>
    { /* ConnectedRouter will use the store from Provider automatically */ }
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/cart/:cart_id" component={ App }/>
        <Route path="*" component={NotFound} />
      </Switch>
    </ConnectedRouter>
  </Provider>
);

export default Routes;
