import { get, post, put, del } from './async';

export const createInvoice = (cart_id, invoice_type, split_type) => post(
  `/api/invoice/${invoice_type}/${cart_id}`,
  'CREATE_INVOICE',
  {'split_type': split_type},
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const fetchLatestInvoiceForCart = cart_id => get(
  `/api/invoice/cart/${cart_id}`,
  'INVOICE_BY_CART',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const fetchInvoice = invoice_id => get(
  `/api/invoice/${invoice_id}`,
  'INVOICE',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const fetchInvoices = cart_id => get(
  `/api/invoice/cart/${cart_id}`,
  'INVOICES',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const fetchPaymentSources = () => get(
  '/api/payment',
  'PAYMENTSOURCES',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const createPaymentSource = (payment_data, payment_source) => post(
  '/api/payment',
  'CREATE_PAYMENTSOURCE',
  {'payment_data': payment_data, 'payment_source': payment_source},
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const deletePaymentSource = (paymentsource_id) => del(
  `/api/payment/${paymentsource_id}`,
  'DELETE_PAYMENTSOURCE',
  (type) => ({
    type: `${type}_SUCCESS`,
    response: paymentsource_id,
    receivedAt: Date.now()
  })
);

export const postPayment = (invoice_id, paymentsource_id) => post(
  `/api/invoice/payment/${invoice_id}`,
  'ADD_PAYMENT', { paymentsource_id },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const sendPaymentCollectionEmails = invoice_id => post(
  `/api/invoice/${invoice_id}`,
  'SEND_COLLECTION_EMAIL', { action: 'email' },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const updateInvoiceOptions = (invoice_id, option, data) => put(
  `/api/invoice/payment/${invoice_id}`,
  'UPDATE_INVOICE_OPTIONS', { option_change: option, option_data: data },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);
