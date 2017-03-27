import reducer from '../cart'

import { NEW_TYPE, RECEIVE_ADD_ITEM_TO_CART, ADD_MEMBER_TO_CART, RECEIVE_CART, REQUEST_CART, RECEIVE_ITEMS, REQUEST_ITEMS } from '../../constants/ActionTypes';

const initialState = {
  cart_id: '',
  magic_link: '',
  cart_leader: '',
  cart_members: [],
  items: [],
  type: NEW_TYPE
};

describe('cart reducer', () => {

	const firstState = initialState

	it('should return the initial state', () => {
		expect(reducer(firstState, {})).toEqual(firstState)
	})

	it('should add 1 single item to the items array', () => {
		const item = {item: 'omg im an item', id: 123}

		expect(reducer(firstState, {
		  	type: RECEIVE_ADD_ITEM_TO_CART,
		  	item
		})).toEqual({...firstState, items: [item]})
	})
})
