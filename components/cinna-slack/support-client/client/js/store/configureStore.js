import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import promiseMiddleware from '../middleware/promiseMiddleware';
import { devTools, persistState } from 'redux-devtools';
import thunk from 'redux-thunk';
import * as reducers from '../reducers';
import {reducer as formReducer} from 'redux-form';
const allReducers = Object.assign({}, reducers, {form: formReducer});
const rootReducer = combineReducers(allReducers);
const createStoreWithMiddleware = compose(
  applyMiddleware(thunk, promiseMiddleware),
  devTools(),
  persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
)(createStore);

export default function configureStore(initialState) {
  const store = createStoreWithMiddleware(rootReducer, initialState);
  return store;
}
