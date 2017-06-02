import { get, post } from './async'

export const updateUser = (id, user) => post(
  `/api/user/${id}`, 
  'STORES',
  user, 
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
)