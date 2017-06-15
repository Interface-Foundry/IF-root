// react/reducers/__tests__/session.test.js

import reducer from '../Session';

import { RECEIVE_SESSION, RECEIVE_UPDATE_SESSION } from '../../constants/ActionTypes';

const initialState = {
  user_account: {},
  animal: '',
  createdAt: '',
  updatedAt: '',
  id: ''
};

describe('session reducer', () => {
  const firstState = initialState;

  it('should return the initial state', () => {
    expect(reducer(firstState, {}))
      .toEqual(firstState);
  });

  it('should update the session with new contents', () => {
    const user_account = {
        email_address: 'abc@def.ghi',
        createdAt: '2017-03-29T17:54:19.351Z',
        updatedAt: '2017-03-29T17:54:19.351Z',
        id: '698d499a-73b6-4ed1-86b6-a965e6467274'
      },
      animal = 'NDT',
      ok = true,
      newAccount = false,
      status = 'NEW_USER',
      id = 123;

    const newSession = {
      user_account,
      animal,
      ok,
      newAccount,
      status,
      id
    };

    expect(reducer(firstState, {
        type: RECEIVE_SESSION,
        newSession
      }))
      .toEqual({
        ...firstState,
        user_account,
        animal,
        ok,
        newAccount,
        status,
        id
      });
  });

  it('should update the session with a new user_account', () => {
    const user = {
        email_address: 'lol@hi.there',
        createdAt: '2017-43-29T17:54:19.351Z',
        updatedAt: '2017-07-29T17:54:19.351Z',
        id: 'weeeeeee'
      },
      newAccount = true;

    const newSession = {
      newAccount,
      user
    };
    expect(reducer(firstState, {
        type: RECEIVE_UPDATE_SESSION,
        newSession
      }))
      .toEqual({
        ...firstState,
        'user_account': user,
        newAccount
      });
  });

  it('should not modify user_account', () => {
    const user = {
        email_address: 'abc@def.ghi',
        createdAt: '2017-03-29T17:54:19.351Z',
        updatedAt: '2017-03-29T17:54:19.351Z',
        id: '698d499a-73b6-4ed1-86b6-a965e6467274'
      },
      newAccount = false;

    const newSession = {
      newAccount,
      user
    };
    expect(reducer(firstState, {
        type: RECEIVE_UPDATE_SESSION,
        newSession,
        user
      }))
      .toEqual({
        ...firstState,
        newAccount
      });
  });
});
