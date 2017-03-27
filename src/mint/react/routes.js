// react/routes.js
// handles choosing which route to render
import React from 'react';
import { Route, Switch } from 'react-router';
import { App } from './containers';

const Routes = () => (
  <Switch>
    <Route path="/cart/:cart_id" component={App} />
    <Route path="*" status={404} />
  </Switch>
);

export default Routes;
