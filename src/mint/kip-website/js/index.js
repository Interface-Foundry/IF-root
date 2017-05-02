import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'
import { Provider } from 'react-redux'
import createHistory from 'history/createBrowserHistory';
import { Router, Route } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { configureStore } from './store/configure-store';
import { get } from './actions';
 
import {
  App
} from './components';

if (module.hot) {
  module.hot.accept();
}

// Add the reducer to your store on the `routing` key
const store = configureStore();

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(createHistory(), store)

// Check the session?? i guess
store.dispatch(get('/api/session', 'SESSION')).then(() => {
	debugger
	store.dispatch(get('/api/carts', 'CARTS'))
})

// Configure View
ReactDOM.render(
	<Provider store={store}>
		<Router history={history}>
      		<Route path="/" component={App}/>
		</Router>
	</Provider>,
	document.getElementById('main')
)
