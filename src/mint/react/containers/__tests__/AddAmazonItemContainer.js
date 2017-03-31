import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import { fakeStore } from '../../utils';
import { AddAmazonItemContainer } from '..';
import { AddAmazonItem } from '../../components';

describe('AddAmazonItemContainer', () => {
  let Container;
  let AddAmazonItemComponent;

  beforeEach(() => {
    const store = fakeStore({
      session: {
        newAccount: false,
        user_accounts: [{ id: 1 }]
      },
      cart: {
        cart_id: 'testId'
      },
      kipForm: {
        currentView: 0,
        animation: true,
        showSiblings: true
      }
    });

    const wrapper = mount(
      <Provider store={store}>
				<AddAmazonItemContainer />
			</Provider>
    );

    Container = wrapper.find(AddAmazonItemContainer);
    AddAmazonItemComponent = Container.find(AddAmazonItem);
  });

  it('should render container', () => {
    expect(Container.length)
      .toBeTruthy();
  });

  it('should render component', () => {
    expect(AddAmazonItemComponent.length)
      .toBeTruthy();
  });
});
