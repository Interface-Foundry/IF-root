import { get, post, del, put } from './async';

export const createInvoice = (cart_id, invoice_type) => post(
  `/api/${invoice_type}/${cart_id}`,
  'CREATE_INVOICE',
  {},
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
  'INVOICE',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);


export const createPaymentSource = ( user_id, payment_body ) => post(
  `/api/payment/${user_id}`,
  'CREATE_PAYMENT',
  { payment_body },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const postPayment = (invoice_id, paymentsource_id) => post(
  `/api/invoice/payment/${invoice_id}`,
  'ADD_PAYMENT',
  { paymentsource_id },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const sendPaymentCollectionEmails = invoice_id => post(
  `/api/invoice/${invoice_id}`,
  'SEND_COLLECTION_EMAIL',
  { action: 'email' },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);


export const updateInvoiceOptions = (invoice_id, option, data) => put(
  `/api/invoice/payment/${invoice_id}`,
  'UPDATE_INVOICE_OPTIONS',
  { option_chage: option, option_data: data },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);
