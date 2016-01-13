import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import promiseMiddleware from '../middleware/promiseMiddleware';
// import { devTools, persistState } from 'redux-devtools';
import DevTools from '../containers/DevTools';
import thunk from 'redux-thunk';
import * as reducers from '../reducers';
import {reducer as formReducer} from 'redux-form';
const allReducers = Object.assign({}, reducers, {form: formReducer});
const rootReducer = combineReducers(allReducers);
const createStoreWithMiddleware = compose(
  applyMiddleware(thunk, promiseMiddleware),
  DevTools.instrument()
  // devTools(),
  // persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
)(createStore);

export default function configureStore(initialState) {
  const store = createStoreWithMiddleware(rootReducer, initialState);
  return store;
}



// import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
// import promiseMiddleware from '../middleware/promiseMiddleware';
// import DevTools from '../containers/DevTools';
// import thunk from 'redux-thunk';
// import rootReducer from '../reducers'

// const finalCreateStore = compose(
//   applyMiddleware(thunk, promiseMiddleware),
//   DevTools.instrument()
// )(createStore);

// export default function configureStore(initialState) {
//   const store = finalCreateStore(rootReducer, initialState);

//   if (module.hot) {
//     // Enable Webpack hot module replacement for reducers
//     module.hot.accept('../reducers', () => {
//       const nextRootReducer = require('../reducers');
//       store.replaceReducer(nextRootReducer);
//     });
//   }

//   return store;
// }