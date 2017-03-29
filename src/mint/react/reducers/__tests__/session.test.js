import reducer from '../session'

import { LOGGED_IN, RECEIVE_SESSION, REQUEST_SESSION, REQUEST_UPDATE_SESSION, RECEIVE_UPDATE_SESSION } from '../../constants/ActionTypes';

const initialState = {
  user_accounts: [],
  animal: '',
  createdAt: '',
  updatedAt: '',
  id: ''
};

describe('cart reducer', () => {
  const firstState = initialState

  it('should return the initial state', () => {
    expect(reducer(firstState, {}))
      .toEqual(firstState)
  })

  it('should update the session with new contents', () => {
    const user_accounts = [{
        email_address: "abc@def.ghi",
        createdAt: "2017-03-29T17:54:19.351Z",
        updatedAt: "2017-03-29T17:54:19.351Z",
        id: "698d499a-73b6-4ed1-86b6-a965e6467274"
      }, {
        email_address: "jkl@mno.pqr",
        createdAt: "2017-03-29T17:54:19.591Z",
        updatedAt: "2017-03-29T17:54:19.591Z",
        id: "idklol"
      }],
      animal = 'NDT',
      ok = true,
      newAccount = false,
      status = "NEW_USER",
      id = 123;

    const newSession = {
      user_accounts,
      animal,
      ok,
      newAccount,
      status,
      id
    }

    expect(reducer(firstState, {
        type: RECEIVE_SESSION,
        newSession
      }))
      .toEqual({
        ...firstState,
        user_accounts,
        animal,
        ok,
        newAccount,
        status,
        id
      })
  })

})
