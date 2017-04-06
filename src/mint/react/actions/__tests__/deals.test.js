import nock from 'nock';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { fakeStore } from '../../utils';
import { fetchDeals } from '../deals';
import { RECEIVE_DEALS, REQUEST_DEALS } from '../../constants/ActionTypes';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('deals actions', () => {
  let body = { fakeResponse: ['do something'] };

  afterEach(() => {
    nock.cleanAll();
  });

  it('creates REQUEST_DEALS, RECEIVE_DEALS when kipform is created has been done', () => {
    nock('http://localhost:3000/api')
      .get('/deals')
      .reply(200, { body });

    const expectedActions = [
      { type: REQUEST_DEALS },
      { type: RECEIVE_DEALS, body }
    ];

    const store = mockStore({
      deals: []
    });

    return store.dispatch(fetchDeals())
      .then(() => {
        expect(store.getDeals())
          .toEqual(expectedActions);
      })
      .catch((error) => {
        // error handler
      });
  });
});
