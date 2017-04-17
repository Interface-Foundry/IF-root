import reducer from '../currentCart';
import { RECEIVE_ADD_ITEM, ADD_MEMBER_TO_CART, RECEIVE_CART, RECEIVE_ITEMS, RECEIVE_REMOVE_ITEM } from '../../constants/ActionTypes';

const initialState = {
  members: [],
  items: [],
  addingItem: false
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
        items: [...firstState.items, item]
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
        items: [...firstState.items, ...items]
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
        ...newCart,
        cart_id: newCart.id
      });
  });

  it('should add a member to the cart', () => {
    const members = [{ name: 'Riley', id: 123 }, { name: 'Sam', id: 321 }];
    const newMember = { name: 'Taylor', id: 246 };
    expect(reducer({
        ...firstState,
        members
      }, {
        type: ADD_MEMBER_TO_CART,
        newMember
      }))
      .toEqual({
        ...firstState,
        members: [...members, newMember]
      });
  });

  it('should remove an item in the cart', () => {
    const items = [{ item: 'omg im an item', id: 123 }, { item: 'omg im an item too', id: 321 }];
    const id = 'abc123';
    const newCart = {
      ...firstState,
      items: [...items, { item: 'whatevs', id }],
    };
    expect(reducer({
        ...newCart
      }, {
        type: RECEIVE_REMOVE_ITEM,
        itemToRemove: id
      }))
      .toEqual({
        ...firstState,
        items
      });
  });
});
