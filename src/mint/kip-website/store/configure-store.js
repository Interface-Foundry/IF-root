/* @flow */

import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { createLogger } from 'redux-logger';
import rootReducer from "../reducers";
import remoteActionMiddleware from './remote-action-middleware';

const loggerMiddleware = createLogger();

const createStoreWithMiddleware = applyMiddleware(
  	thunkMiddleware,
  	loggerMiddleware
)(createStore);

export const configureStore = function (initialState: Object = {}): Function {
  return createStoreWithMiddleware(rootReducer, initialState);
};

export default configureStore;
