import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import auth from './auth/auth';
import app from './app/app';

export default combineReducers({
	routing: routerReducer,
	auth,
	app
});


