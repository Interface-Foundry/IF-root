// react/reducers/session.js
const initialState = {
  selectedAddress: {},
  addresses: []
};

export default (state = initialState, action) => {
  switch (action.type) {
  case 'LOGOUT':
    return {};
  case 'LOGIN_SUCCESS':
  case 'UPDATE_USER_SUCCESS':
  case 'CODE_SUCCESS':
  case 'SESSION_SUCCESS':
    return {
      ...state,
      ...action.response.user_account
    };
  case 'CLEAR_SELECTED_ADDRESS':
    return {
      ...state,
      selectedAddress: {}
    };
  case 'GET_ADDRESSES_SUCCESS':
    return {
      ...state,
      selectedAddress: {},
      addresses: action.response
    };
  case 'SELECT_ADDRESS_SUCCESS':
    return {
      ...state,
      selectedAddress: state.addresses.find(a => a.id === action.selectedAddress.id) || {} // select the address but don't return undef
    };
  case 'UPDATE_ADDRESS_SUCCESS':
    return {
      ...state,
      addresses: state.addresses.map(addr => addr.id === action.address.id ? action.address : addr)
    };
  case 'DELETE_ADDRESS_SUCCESS':
    return {
      ...state,
      addresses: action.addresses
    };
  case 'ADD_ADDRESS_SUCCESS':
    return {
      ...state,
      addresses: [action.newAddress, ...state.addresses]
    };
  default:
    return state;
  }
};