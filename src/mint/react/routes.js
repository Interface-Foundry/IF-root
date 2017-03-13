// react/routes.js
// handles choosing which route to render
import React from 'react';
import {
  Router,
  Route,
  IndexRoute
} from 'react-router';

import App from './components/App';
import NotFound from './components/NotFound';

const Routes = (props) => (
  <Router {...props}>
    <Route path="/" component={ App }>
      <IndexRoute component={App} />
      <Route path="/cart/:cart_id" component={ App } />
    </Route>
    <Route path="*" component={NotFound} />
  </Router>
);

export default Routes;
