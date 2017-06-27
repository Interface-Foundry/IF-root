// react/reducers/invoices.js

const initialState = {
  paymentSources: []
};

export default function payments(state = initialState, action) {
  switch (action.type) {
  case 'PAYMENTSOURCES_SUCCESS':
    return {
      ...state,
      paymentSources: action.response
    };
  case 'DELETE_PAYMENTSOURCE_LOADING':
    return {
      ...state
    };
  case 'DELETE_PAYMENTSOURCE_SUCCESS':
    return {
      ...state,
      paymentSources: state.paymentSources.filter((paymentSource, i) => paymentSource.id !== action.response)
    };
  case 'CREATE_PAYMENTSOURCE_SUCCESS':
    return {
      ...state,
      paymentSources: action.response
    };
  default:
    return state;
  }
}
