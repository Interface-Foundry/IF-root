import { post } from './async';

export const toggleSidenav = () => ({
  type: 'TOGGLE_SIDENAV'
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
