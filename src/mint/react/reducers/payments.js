// react/reducers/invoices.js

const initialState = {
  paymentSources: [],
  invoice: {},
  userPaymentStatus: { paid: false }
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
      userPaymentStatus: action.response
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
  case 'INVOICE_BY_CART_FAIL':
    return {
      ...state,
      invoice: { 'display': false }
    };
  case 'UPDATE_INVOICE_OPTIONS_SUCCESS':
    return {
      ...state,
      invoice: action.response
    };
  case 'CREATE_PAYMENT_SUCCESS':
    return {
      ...state,
      userPaymentStatus: action.response
    };
  case 'CREATE_PAYMENT_WITHOUT_SOURCE':
    return {
      ...state,
      userPaymentStatus: action.response
    };
  case 'FETCH_PAYMENT_STATUS_SUCCESS':
    return {
      ...state,
      userPaymentStatus: action.response
    };
  case 'SELECT_ADDRESS_SUCCESS':
    return {
      ...state,
      invoice: {
        ...state.invoice,
        address: action.address
      }
    };
  default:
    return state;
  }
}