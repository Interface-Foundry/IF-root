import nock from 'nock'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { fakeStore } from '../../utils';
import { signIn, update } from '../session'
import { REQUEST_UPDATE_SESSION, RECEIVE_UPDATE_SESSION } from '../../constants/ActionTypes'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

describe('session actions', () => {
  let body;

  afterEach(() => {
    nock.cleanAll()
  })

  body = { fakeResponse: ['do something'] }

  it('creates RECEIVE_UPDATE_SESSION when signIn has been done', () => {
    nock('http://localhost:3000/api')
      .get('/identify')
      .query({cart_id: 'fakeId', email: 'fakeEmail'})
      .reply(200, { body })

    const expectedActions = [
      { type: REQUEST_UPDATE_SESSION },
      { type: RECEIVE_UPDATE_SESSION, body }
    ]

    const store = mockStore({
      session: {  
        newAccount: false,
        onborded: false,
        user_accounts: [{id: 1}]
      },
      cart: {  
        cart_id: 'testId',
        items: [{id: 1}]
      }
    });

    return store.dispatch(signIn('testId', 'fakeEmail'))
      .then(() => { 
        expect(store.getActions()).toEqual(expectedActions)
      })
  })
})