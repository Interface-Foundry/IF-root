import { get, post, put, del } from './async';


export const fetchAddress = user_id => get(
  `/api/cart/${user_id}`,
  'CART',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

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
