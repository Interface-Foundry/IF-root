// react/reducers/invoices.js

const initialState = {
  paymentSources: []
};

export default function payments(state = initialState, action) {
  switch (action.type) {
  case 'PAYMENTSOURCES_SUCCESS':
    return {
      ...state,
      paymentSources: [...action.response]
    };
  default:
    return state;
  }
}
