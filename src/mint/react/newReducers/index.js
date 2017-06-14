// react/reducers/index.js

import app from './app';
import cart from './cart';
import carts from './carts';
import stores from './stores';
import session from './session';
import search from './search';
import user from './user';

import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

export default combineReducers({
  app,
  cart,
  carts,
  stores,
  session,
  search,
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
