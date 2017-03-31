import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import { fakeStore } from '../../utils';
import { SignInContainer } from '..';
import { SignIn } from '../../components';

describe('SignInContainer', () => {
  let Container;
  let SignInComponent;
  let subject = null
  let submitting, touched, error, reset, onSave, onSaveResponse, handleSubmit

  beforeEach(() => {
    submitting = false
    touched = false
    error = null
    reset = fn => fn
    onSaveResponse = Promise.resolve()
    handleSubmit = fn => fn

    const formProps = {
      onSave,
      submitting: submitting,
      // The real redux form has many properties for each field,
      // including onChange and onBlur handlers. We only need to provide
      // the ones that will change the rendered output.
      fields: {
        email: {
          value: '',
          touched: touched,
          error: error
        },
        url: {
          value: '',
          touched: touched,
          error: error
        }
      },
      handleSubmit,
      reset
    }

    const store = fakeStore({
      session: {
        newAccount: false,
        onborded: false,
        user_accounts: [{ id: 1 }]
      },
      cart: {
        cart_id: 'testId',
        items: [{ id: 1 }]
      },
      kipForm: {
        currentView: 0,
        animation: true,
        showSiblings: true
      }
    });

    const wrapper = mount(
      <Provider store={store}>
				<SignInContainer {...formProps}/>
			</Provider>
    );

    Container = wrapper.find(SignInContainer);
    SignInComponent = Container.find(SignIn);
  });

  it('should render container', () => {
    expect(Container.length)
      .toBeTruthy();
  });

  it('should render component', () => {
    expect(SignInComponent.length)
      .toBeTruthy();
  });
});
