import { createStore, applyMiddleware, compose } from "redux";
import { routerMiddleware } from 'react-router-redux'
import { browserHistory } from 'react-router'

import Reducers from "../reducers";

import thunkMiddleware from "redux-thunk";

const bleh = (history) => {
  const historyMiddleware = routerMiddleware(history);
  return createStore(
    Reducers,
    applyMiddleware(historyMiddleware),
    applyMiddleware(thunkMiddleware)
  );
};
export default bleh;
