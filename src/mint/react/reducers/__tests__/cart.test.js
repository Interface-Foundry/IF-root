import reducer from '../cart'

import { NEW_TYPE, RECEIVE_ADD_ITEM_TO_CART, ADD_MEMBER_TO_CART, RECEIVE_CART, REQUEST_CART, RECEIVE_ITEMS, REQUEST_ITEMS } from '../../constants/ActionTypes';

const initialState = {
  cart_id: '',
  magic_link: '',
  members: [],
  leader: null,
  SetAddingItem: false,
  items: []
};

describe('cart reducer', () => {
  const firstState = initialState

  it('should return the initial state', () => {
    expect(reducer(firstState, {}))
      .toEqual(firstState)
  })

  it('should add 1 single item to the items array', () => {
    const item = { item: 'omg im an item', id: 123 }

    expect(reducer(firstState, {
        type: RECEIVE_ADD_ITEM_TO_CART,
        item
      }))
      .toEqual({...firstState, items: [item] })
  })

  it('should add items to the array', () => {
    const items = [{ item: 'omg im an item', id: 123 }, { item: 'omg im an item too', id: 321 }];
    expect(reducer(firstState, {
        type: RECEIVE_ITEMS,
        items
      }))
      .toEqual({...firstState, items: items })
  })

  it('should update the cart with new contents', () => {
    const items = [{ item: 'omg im an item', id: 123 }, { item: 'omg im an item too', id: 321 }];
    const id = 'abc123'
    const newCart = {
      items,
      id
    }
    expect(reducer(firstState, {
        type: RECEIVE_CART,
        newCart
      }))
      .toEqual({...firstState, ...newCart, cart_id: id })
  })

  it('should add a member to the cart', () => {
    const members = [{ name: 'Riley', id: 123 }, { name: 'Sam', id: 321 }];
    const newMember = { name: 'Taylor', id: 246 };
    expect(reducer({...firstState, members}, {
        type: ADD_MEMBER_TO_CART,
        newMember
      }))
      .toEqual({
        ...firstState,
        members: [...members, newMember]
      })
  })
})
