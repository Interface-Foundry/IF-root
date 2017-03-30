import reducer from '../session'

import { LOGGED_IN, ONBOARD_NEW_USER, REGISTER_EMAIL, RECEIVE_SESSION, REQUEST_SESSION, REQUEST_UPDATE_SESSION, RECEIVE_UPDATE_SESSION } from '../../constants/ActionTypes';

const initialState = {
  user_accounts: [],
  animal: '',
  createdAt: '',
  updatedAt: '',
  id: ''
};

describe('session reducer', () => {
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

  it('should update the session with a new user_account', () => {
    const user = [{
        email_address: "lol@hi.there",
        createdAt: "2017-43-29T17:54:19.351Z",
        updatedAt: "2017-07-29T17:54:19.351Z",
        id: "weeeeeee"
      }],
      newAccount = true;

    const newSession = {
      newAccount,
      user
    }
    expect(reducer(firstState, {
        type: RECEIVE_UPDATE_SESSION,
        newSession
      }))
      .toEqual({
        ...firstState,
        'user_accounts': [...firstState.user_accounts, user],
        newAccount
      })
  })

  it('should not modify user_accounts', () => {
    const user = [{
        email_address: "abc@def.ghi",
        createdAt: "2017-03-29T17:54:19.351Z",
        updatedAt: "2017-03-29T17:54:19.351Z",
        id: "698d499a-73b6-4ed1-86b6-a965e6467274"
      }],
      newAccount = false;

    const newSession = {
      newAccount,
      user
    }
    expect(reducer(firstState, {
        type: RECEIVE_UPDATE_SESSION,
        newSession,
        user
      }))
      .toEqual({
        ...firstState,
        newAccount
      })
  })

  it('should mark user as onboarding', () => {
    expect(reducer(firstState, {
        type: ONBOARD_NEW_USER,
        ...firstState
      }))
      .toEqual({
        ...firstState,
        onboarding: true
      })
  })

  it('should mark user as onboarding and registered', () => {
    expect(reducer(firstState, {
        type: REGISTER_EMAIL,
        ...firstState
      }))
      .toEqual({
        ...firstState,
        onboarding: true,
        registered: true
      })
  })

  it('should mark user as logged out', () => {
    expect(reducer({
        ...firstState,
      }, {
        ...firstState,
        type: LOGGED_IN,
      }))
      .toEqual({
        ...firstState,
        loggedIn: false
      })
  })

  it('should mark user as logged in', () => {
    expect(reducer({
        ...firstState,
        user_accounts: ['a', 'b', 'c']
      }, {
        ...firstState,
        type: LOGGED_IN,
        user_accounts: ['a', 'b', 'c']
      }))
      .toEqual({
        ...firstState,
        user_accounts: ['a', 'b', 'c'],
        loggedIn: true
      })
  })
})
