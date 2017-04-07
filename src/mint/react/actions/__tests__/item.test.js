  import nock from 'nock';
  import configureMockStore from 'redux-mock-store';
  import thunk from 'redux-thunk';

  import { fakeStore } from '../../utils';
  import { addItem } from '../item';
  import { REQUEST_ADD_ITEM, RECEIVE_ADD_ITEM } from '../../constants/ActionTypes';

  const middlewares = [thunk];
  const mockStore = configureMockStore(middlewares);

  describe('cart actions', () => {
    let body = { fakeResponse: ['do something'] };

    afterEach(() => {
      nock.cleanAll();
    });

    it('creates REQUEST_ADD_ITEM, RECEIVE_ADD_ITEM when addItem has been done', () => {
      nock('http://localhost:3000/api')
        .get('/cart/fakeid/items')
        .reply(200, { body });

      const expectedActions = [
        { type: REQUEST_ADD_ITEM },
        { type: RECEIVE_ADD_ITEM, body }
      ];

      const store = mockStore({
        session: {
          newAccount: false,
          onborded: false,
          user_accounts: [{ id: 1 }]
        },
        cart: {
          cart_id: 'testId',
          items: [{ id: 1 }]
        }
      });

      return store.dispatch(addItem('testId'))
        .then(() => {
          expect(store.getActions())
            .toEqual(expectedActions);
        })
        .catch((error) => {
          // error handler
        });
    });
  });
