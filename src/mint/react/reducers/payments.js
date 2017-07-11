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
  case 'INVOICE_SUCCESS':
    return {
      ...state,
      invoice: action.response
    };
  case 'CREATE_INVOICE_SUCCESS':
    return {
      ...state,
      invoice: action.response
    };
  case 'INVOICE_BY_CART_SUCCESS':
    return {
      ...state,
      invoice: action.response
    };
  case 'UPDATE_INVOICE_OPTIONS_SUCCESS':
    return {
      ...state,
      invoice: action.response
    };
  case 'CREATE_PAYMENT_SUCCESS':
    return {
      ...state,
      payment: action.response
    };
  case 'FETCH_PAYMENT_STATUS_SUCCESS':
    return {
      ...state,
      userPaymentStatus: action.response
    };
  default:
    return state;
  }
}
