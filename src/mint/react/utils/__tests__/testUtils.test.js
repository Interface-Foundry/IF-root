import { fakeStore } from '..'

describe('testUtils util', () => {

  describe('fakeStore', () => {
    const state = {
      cart: {  
        cart_id: 'testId'
      }
    };

    it("should return state with merged store properties", () => {
      expect(Object.keys(fakeStore(state)))
        .toEqual([
          'default',
          'subscribe',
          'dispatch',
          'getState'
        ])
    })

    it("should return original state when getState is called", () => {
      expect(fakeStore(state).getState())
        .toEqual({ ...state })
    })
  })

})
