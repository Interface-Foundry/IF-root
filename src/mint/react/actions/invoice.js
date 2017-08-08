import { get, post, put, del } from './async';

export const createInvoice = (cart_id, invoice_type, split_type) => get(
  `/api/invoice/${invoice_type}/${cart_id}`,
  'CREATE_INVOICE',
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

export const fetchInvoiceByCart = cart_id => get(
  `/api/invoice/cart/${cart_id}`,
  'INVOICE_BY_CART',
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

export const fetchPaymentStatus = invoice_id => get(
  `/api/invoice/payment/${invoice_id}`,
  'FETCH_PAYMENT_STATUS',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const createPayment = (paymentsource_id, invoice_id) => post(
  `/api/payment/${paymentsource_id}`,
  'CREATE_PAYMENT',
  { 'invoice_id': invoice_id },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const refundPayment = (payment_id) => post(
  '/api/invoice/refund',
  'REFUND_PAYMENT',
  { 'payment_id': payment_id },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const refundInvoice = (invoice_id) => post(
  '/api/invoice/refund',
  'REFUND_INVOICE',
  { 'invoice_id': invoice_id },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const createPaymentWithoutSource = (amount, payment_data, payment_source, invoice) => post(
  `/api/payment/${payment_source}`,
  'CREATE_PAYMENT_WITHOUT_SOURCE',
  {'amount': amount, 'invoice_id': invoice, 'payment_data': payment_data},
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const createPaymentSource = (amount, payment_data, payment_source, invoice) => post(
  '/api/payment',
  'CREATE_PAYMENTSOURCE',
  {'amount': amount, 'invoice_id': invoice, 'payment_data': payment_data, 'payment_source': payment_source},
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

export const updateInvoice = (invoice_id, option, data) => put(
  `/api/invoice/${invoice_id}`,
  'UPDATE_INVOICE_OPTIONS',
  { 'option_change': option, 'option_data': data },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const actionInvoice = (invoice_id, action, data) => {
  return post(
    `/api/invoice/${invoice_id}`,
    'ACTION_INVOICE',
    { 'action': action, 'data': data },
    (type, json) => ({
      type: `${type}_SUCCESS`,
      response: json,
      receivedAt: Date.now()
    })
  );
}
