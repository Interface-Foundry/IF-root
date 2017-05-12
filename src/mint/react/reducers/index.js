// react/reducers/index.js

import currentCart from './currentCart';
import otherCarts from './otherCarts';
import cartStores from './cartStores';
import session from './session';
import cards from './cards';
import item from './item';
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as form } from 'redux-form';

export default combineReducers({
  currentCart,
  otherCarts,
  cards,
  item,
  session,
  form,
  routing,
  cartStores
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
