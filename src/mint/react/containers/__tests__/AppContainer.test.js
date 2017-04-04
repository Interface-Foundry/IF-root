import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import { fakeStore } from '../../utils';
import { AppContainer } from '..';
import { App } from '../../components';

describe('AppContainer', () => {
  let Container;
  let AppComponent;

  beforeEach(() => {
    const store = fakeStore({
      session: {
        newAccount: false,
        user_accounts: [{ id: 1 }]
      },
      cart: {
        cart_id: 'testId',
        items: [{ id: 1 }],
        members: [{ id: 1 }],
        leader: { id: 2 }
      },
      modal: {
        component: null
      }
    });

    const wrapper = mount(
      <Provider store={store}>
				<AppContainer match={{params: {cart_id: 'testId'}}}/>
			</Provider>
    );

    Container = wrapper.find(AppContainer);
    AppComponent = Container.find(App);
  });

  it('should render container', () => {
    expect(Container.length)
      .toBeTruthy();
  });

  it('should render component', () => {
    expect(AppComponent.length)
      .toBeTruthy();
  });
});
