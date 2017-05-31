import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import auth from './auth/auth';
import app from './app/app';
import siteState from './siteState/siteState';

export default combineReducers({
  routing: routerReducer,
  auth,
  app,
  siteState
});