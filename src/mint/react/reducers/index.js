import currentCart from './CurrentCart';
import otherCarts from './OtherCarts';
import session from './Session';
import deals from './Deals';
import item from './Item';
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
from './CurrentCart';

export {
  getCartById
}
from './OtherCarts';
