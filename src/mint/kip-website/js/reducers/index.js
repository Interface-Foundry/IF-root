import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import landing from './landing/landing';
import auth from './auth/auth';

export { desktopScroll, mobileScroll } from './landing/landing';

export default combineReducers({
	routing: routerReducer,
	landing,
	auth
});


