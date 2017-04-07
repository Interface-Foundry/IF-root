import reducer from '../cart';
import { RECEIVE_ADD_ITEM, ADD_MEMBER_TO_CART, RECEIVE_CART, RECEIVE_ITEMS } from '../../constants/ActionTypes';

const initialState = {
  carts: [],
  currentCart: {
    members: [],
    items: []
  },
  SetAddingItem: false
};

describe('cart reducer', () => {
  const firstState = initialState;

  it('should return the initial state', () => {
    expect(reducer(firstState, {}))
      .toEqual(firstState);
  });

  it('should add 1 single item to the items array', () => {
    const item = { item: 'omg im an item', id: 123 };
    expect(reducer(firstState, {
        type: RECEIVE_ADD_ITEM,
        item
      }))
      .toEqual({
        ...firstState,
        currentCart: {
          ...firstState.currentCart,
          items: [...firstState.currentCart.items, item]
        }
      });
  });

  it('should add items to the items array', () => {
    const items = [{ item: 'omg im an item', id: 123 }, { item: 'omg im an item too', id: 321 }];
    expect(reducer(firstState, {
        type: RECEIVE_ITEMS,
        items
      }))
      .toEqual({
        ...firstState,
        currentCart: {
          ...firstState.currentCart,
          items: [...firstState.currentCart.items, ...items]
        }
      });
  });

  it('should update the cart with new contents', () => {
    const items = [{ item: 'omg im an item', id: 123 }, { item: 'omg im an item too', id: 321 }];
    const id = 'abc123';
    const newCart = {
      items,
      id
    };
    expect(reducer(firstState, {
        type: RECEIVE_CART,
        currentCart: newCart
      }))
      .toEqual({
        ...firstState,
        currentCart: newCart,
        cart_id: id
      });
  });

  it('should add a member to the cart', () => {
    const members = [{ name: 'Riley', id: 123 }, { name: 'Sam', id: 321 }];
    const newMember = { name: 'Taylor', id: 246 };
    expect(reducer({
        ...firstState,
        currentCart: {
          ...firstState.currentCart,
          members
        }
      }, {
        type: ADD_MEMBER_TO_CART,
        newMember
      }))
      .toEqual({
        ...firstState,
        currentCart: {
          ...firstState.currentCart,
          members: [...members, newMember]
        }
      });
  });
});
