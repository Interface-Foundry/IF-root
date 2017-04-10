import cart from './cart';
import session from './session';
import deals from './deals';
import item from './item';
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as form } from 'redux-form';

export default combineReducers({
  cart,
  deals,
  item,
  session,
  form,
  routing
});

// export selectors
export {
  getAccountById
}
from './session';

export {
  getMemberById,
  getItemById
}
from './cart';
