import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import hero from './hero/hero';
import landing from './landing/landing';


export default combineReducers({
	routing: routerReducer,
	hero,
	landing
});


