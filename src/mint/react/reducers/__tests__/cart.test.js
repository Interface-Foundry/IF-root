import reducer from '../cart'

describe('cart reducer', () => {

	const initialState = {
		open: false,
		thisShouldNotChange: true // array of product ids
	};

	it('should return the initial state', () => {
		expect(reducer(initialState, {})).toEqual(initialState)
	})
})
