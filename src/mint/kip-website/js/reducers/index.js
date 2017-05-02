import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import hero from './hero/hero';
import landing from './landing/landing';
import auth from './auth/auth';


export default combineReducers({
	routing: routerReducer,
	hero,
	landing,
	auth
});


