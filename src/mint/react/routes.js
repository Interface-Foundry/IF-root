// react/routes.js
// handles choosing which route to render
import React from 'react'
import ReactDOM from 'react-dom'

import {createStore, combineReducers, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'

import createHistory from 'history/createBrowserHistory'
import {Route, Switch} from 'react-router'

import {ConnectedRouter, routerReducer, routerMiddleware, push} from 'react-router-redux'

// import reducers from './reducers' // Or wherever you keep your reducers
import App from './pages/App';
import NotFound from './pages/NotFound';

// reducers
import CartReducer from './reducers/cart';
import ItemReducer from './reducers/item';
import UserReducer from './reducers/user';

// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory();

// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history);

// Add the reducer to your store on the `router` key
// Also apply our middleware for navigating
const store = createStore(
  combineReducers({
    CartReducer,
    ItemReducer,
    UserReducer,
    router: routerReducer
  }),
  applyMiddleware(middleware)
);

// Log the initial state
console.log(store.getState())

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
let unsubscribe = store.subscribe(() =>
  console.log(store.getState())
)
store.dispatch(UserReducer({
  user_id: 'abc',
  user_email: 'abc@gmail.com',
  carts: [
    CartReducer({
      added_by: 'abc',
      items: []
    })
  ]
}));

// unsubscribe()
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
