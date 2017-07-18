import { post } from './async';

export const toggleSidenav = () => ({
  type: 'TOGGLE_SIDENAV'
});

export const setHeaderCheckout = show => ({
  type: 'TOGGLE_HEADER_CHECKOUT',
  show
});

export const toggleYpoCheckout = show => ({
  type: 'TOGGLE_YPO_CHECKOUT',
  show
});

export const toggleAddressForm = show => ({
  type: 'TOGGLE_ADDRESS_FORM',
  show
});

export const togglePopup = () => ({
  type: 'TOGGLE_POPUP'
});

export const selectTab = tab => ({
  type: 'SELECT_VIEW_TAB',
  response: {
    tab
  }
});

export const selectAddress = address => ({
  type: 'SELECT_ADDRESS',
  response: {
    address
  }
});

export const selectAccordion = selectedAccordion => ({
  type: 'SELECT_INVOICE_ACCORDION',
  response: {
    selectedAccordion
  }
});

export const postFeedback = (feedback) => post(
  '/api/feedback',
  'FEEDBACK',
  feedback,
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);
