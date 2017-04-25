// react/reducers/index.js

import currentCart from './currentCart';
import otherCarts from './otherCarts';
import session from './session';
import deals from './deals';
import item from './item';
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as form } from 'redux-form';

export default combineReducers({
  currentCart,
  otherCarts,
  deals,
  item,
  session,
  form,
  routing
});

// export selectors

export {
  getMemberById,
  splitCartById
}
from './currentCart';

export {
  getCartById
}
from './otherCarts';
