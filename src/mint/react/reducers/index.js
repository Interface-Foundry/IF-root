import cart from './cart';
import item from './item';
import session from './session';
import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';

export default combineReducers({
   cart,
   item,
   session,
   routing: routerReducer
 })
