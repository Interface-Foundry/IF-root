// react/routes.js
// handles choosing which route to render
import React from 'react'
import ReactDOM from 'react-dom'

import {
  createStore,
  combineReducers,
  applyMiddleware
} from 'redux'
import {
  Provider
} from 'react-redux'

import createHistory from 'history/createBrowserHistory'
import {
  Route,
  Switch
} from 'react-router'

import {
  ConnectedRouter,
  routerReducer,
  routerMiddleware,
  push
} from 'react-router-redux'

// import reducers from './reducers' // Or wherever you keep your reducers
import App from './pages/App';
import NotFound from './pages/NotFound';

// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory();

// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history);

// Add the reducer to your store on the `router` key
// Also apply our middleware for navigating
const store = createStore(
  combineReducers({
    // ...reducers,
    router: routerReducer
  }),
  applyMiddleware(middleware)
);

// const Routes = (props) => (
//    <Provider store={store}>
//     <ConnectedRouter {...props}>
//       <Route path="/cart/:cart_id" component={ App }/>
//       <Route path="*" component={NotFound} />
//     </ConnectedRouter>
//   </Provider>
// );
// 

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
