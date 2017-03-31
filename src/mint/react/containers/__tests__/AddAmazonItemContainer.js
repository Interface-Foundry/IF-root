import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import { fakeStore } from '../../utils';
import { AddAmazonItemContainer } from '..';
import { AddAmazonItem } from '../../components';

describe('AddAmazonItemContainer', () => {
  let Container;
  let AddAmazonItemComponent;
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
      cart: {
        cart_id: 'testId'
      }
    });

    const wrapper = mount(
      <Provider store={store}>
				<AddAmazonItemContainer {...formProps}/>
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
