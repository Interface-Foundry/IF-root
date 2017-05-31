// react/reducers/index.js

import app from './app';
import cart from './cart';
import carts from './carts';
import store from './store';
import session from './session';
import search from './search';
import item from './item';
import user from './user';

import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as form } from 'redux-form';

export default combineReducers({
  app,
  cart,
  carts,
  store,
  session,
  search,
  item,
  user,
  routing
});

// export selectors

export {
  getMemberById,
  splitCartById
}
from './cart';

export {
  getCartById
}
from './carts';
