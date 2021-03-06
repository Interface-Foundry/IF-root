// kip-website/index.js

import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { Route } from 'react-router-dom';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import Reducers from './reducers';
import { get, getSiteState, checkSession } from './actions';
import { AppContainer } from './containers';

//Analytics!
import ReactGA from 'react-ga';

if (module.hot
  && (!process.env.BUILD_MODE || !process.env.BUILD_MODE.includes('prebuilt'))
  && (!process.env.NODE_ENV || !process.env.NODE_ENV.includes('production'))) {
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

// Check session and prep carts and blogs
store.dispatch(checkSession()).then(() => {
  store.dispatch(getSiteState(window.location.pathname)).then(() => {
    // idk if this is an ok thing, but it keeps the site
    // from rendering before it recieves the json file of text
    // there's probably a better way tbh
    ReactDOM.render(
      <Provider store={store}>
      <ConnectedRouter history={history}>
        <Route path="/" component={AppContainer}/>
      </ConnectedRouter>
    </Provider>,
      document.getElementById('root')
    );
    store.dispatch(get('/api/session', 'SESSION'));
  }).then(() => {
    const sessionId = store.getState()
      .auth.id;
    if (sessionId && process.env.GA) {
      ReactGA.initialize('UA-51752546-10', {
        gaOptions: {
          userId: sessionId
        }
      });
      ReactGA.event({
        category: 'ABTest',
        action: store.getState()
          .siteState.siteVersion
      });
    }
  })
  .then(() => Promise.all([store.dispatch(get('/api/carts', 'CARTS')), store.dispatch(get('/api/blog/posts', 'POSTS'))]));
});

