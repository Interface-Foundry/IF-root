import cart from './cart';
import item from './item';
import session from './session';
import kipForm from './kipForm';
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as form } from 'redux-form';

export default combineReducers({
   kipForm,
   cart,
   item,
   session,
   form,
   routing: routerReducer
 })
