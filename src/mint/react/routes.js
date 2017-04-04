// react/routes.js
// handles choosing which route to render
import React from 'react';
import { Route, Switch } from 'react-router';
import { AppContainer } from './containers';

const Routes = () => (
  <Switch>
    <Route path="/cart/:cart_id" component={AppContainer} />
    <Route path="/cart/:cart_id/*" component={AppContainer} />
    <Route path="*" status={404} />
  </Switch>
);

export default Routes;
