import { post } from './async';

export const updateUser = (id, user) => post(
  `/api/user/${id}`,
  'UPDATE_USER',
  user,
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: {
      user_account: json
    },
    receivedAt: Date.now()
  })
);
