import { get, post } from './async';

export const checkSession = () => get(
  '/api/session',
  'SESSION',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const login = (cart_id, email) => get(
  `/api/login?email=${encodeURIComponent(email)}&redirect=/cart/${cart_id}`,
  'LOGIN',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const validateCode = (email, code) => post(
  `/auth/quick/${code}`,
  'CODE', { email },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const postFeedback = (feedback) => post(
  '/api/feedback',
  'FEEDBACK', { feedback },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);


