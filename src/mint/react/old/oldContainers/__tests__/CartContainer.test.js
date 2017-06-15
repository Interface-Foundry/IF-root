// react/containers/__tests__/CartContainer.test.js

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import { fakeStore } from '../../utils';
import { CartContainer } from '..';
import { Cart } from '../../components';

describe('CartContainer', () => {
  let Container;
  let CartComponent;

  beforeEach(() => {
    const store = fakeStore({
      session: {
        newAccount: false,
        onborded: false,
        user_account: { id: 1 }
      },
      cart: {
        cart_id: 'testId',
        items: [{ id: 1 }],
        members: [{ id: 1 }],
        leader: { id: 2 }
      }
    });

    const wrapper = mount(
      <Provider store={store}>
				<CartContainer />
			</Provider>
    );

    Container = wrapper.find(CartContainer);
    CartComponent = Container.find(Cart);
  });

  it('should render container', () => {
    expect(Container.length)
      .toBeTruthy();
  });

  it('should render component', () => {
    expect(CartComponent.length)
      .toBeTruthy();
  });
});
