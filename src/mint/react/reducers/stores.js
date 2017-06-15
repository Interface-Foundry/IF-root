// react/reducers/cartStores.js
const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
  case 'LOGOUT':
    return initialState;
  case 'STORES_SUCCESS':
    return [
      ...action.response
    ];
  default:
    return state;
  }
};
