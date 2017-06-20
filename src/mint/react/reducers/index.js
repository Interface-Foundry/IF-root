// react/reducers/index.js
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import undoable, { includeAction } from 'redux-undo';

import app from './app';
import cart from './cart';
import carts from './carts';
import stores from './stores';
import session from './session';
import search from './search';
import user from './user';

export default combineReducers({
  app,
  cart: undoable(cart, {
    filter: includeAction(['REMOVE_ITEM_LOADING', 'REMOVE_ITEM_SUCCESS']),
    limit: 5,
    debug: true
  }),
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
