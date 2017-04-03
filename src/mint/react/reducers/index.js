import cart from './cart';
import modal from './modal';
import session from './session';
import deals from './deals';
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as form } from 'redux-form';

export default combineReducers({
  cart,
  modal,
  session,
  form,
  deals,
  routing: routerReducer
});

// export selectors
export {
  getAccountById
} from './session';

export {
	getMemberById,
	getItemById
} from './cart';
