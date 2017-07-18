import { get, post } from './async';

export const toggleAddressForm = show => ({
  type: 'TOGGLE_ADDRESS_FORM',
  show
});

export const selectAddress = ({ selectedAddressId }) => ({
  type: 'SELECT_ADDRESS',
  selectedAddressId
});

export const clearSelectedAddress = () => ({
  type: 'CLEAR_SELECTED_ADDRESS'
});

export const fetchAddresses = () => get(
  '/api/user/addresses',
  'GET_ADDRESSES',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const createInvoice = (cart_id, invoice_type, split_type) => post(
  `/api/invoice/${invoice_type}/${cart_id}`,
  'CREATE_INVOICE', { 'split_type': split_type },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const addAddress = ({ full_name, line_1, line_2, city, region, code, country, user_account }) => post(
  `/api/user/${user_account}/address`,
  'ADD_ADDRESS', { full_name, line_1, line_2, city, region, code, country, user_account },
  (type, newAddress) => ({
    type: `${type}_SUCCESS`,
    newAddress
  })
);

export const updateAddress = ({ full_name, line_1, line_2, city, region, code, country, user_account, address_id }) => post(
  `/api/user/${user_account}/address/${address_id}`,
  'UPDATE_ADDRESS', { full_name, line_1, line_2, city, region, code, country, user_account },
  (type, address) => ({
    type: `${type}_SUCCESS`,
    address
  })
);
