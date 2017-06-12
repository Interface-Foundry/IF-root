// react/components/AddressForm/AddressForm.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from '../../../react-common/components';

export default class AddressForm extends Component {
  state = {
    form: {}
  }

  /**
   * formData is an array of the following format
   *   formData = [{
   *      head: 'Your YPO Account',
   *      fields: [{
   *          name: 'ypoName',
   *          placeholder: 'YPO Account Name',
   *          label: 'YPO Account Name',
   *          type: 'text',
   *          autocomplete: 'address',
   *          required: true,
   *          autoFocus: true, //there can only be one autofocus
   *        }, ...]
   *    }, ...]
   */
  static propTypes = {
    submitForm: PropTypes.func,
    formData: PropTypes.array,
    history: PropTypes.object,
    user_id: PropTypes.string,
    cart_id: PropTypes.string
  }

  componentDidMount() {
    const { formData = [] } = this.props, form = {};
    // flatten and initialize all of the values so that we can prefill
    formData.forEach((d) => d.fields.forEach(f => form[f.name] = { val: f.value || '' }));
    this.setState({ form });
  }

  _updateField = (val, field) => this.setState(s => {
    const form = {
      ...s.form
    }; //make sure its a copy
    form[field] = { val, modified: true };
    return form;
  });

  _checkout = (e) => {
    e.preventDefault();
    const {
      props: { submitForm, user_id, cart_id, history: { replace } },
      state: { form }
    } = this;
    submitForm(user_id, form);
    replace(`/cart/${cart_id}`);
    window.open(`/api/cart/${cart_id}/checkout`); // ¯\_(ツ)_/¯
  }

  render() {
    const {
      _updateField,
      _checkout,
      props: { cart_id, formData = [], history: { replace } }
    } = this;

    return (
      <div className='address_overlay'>
        <div className='address_form'>
          <h1>
            <span onClick={()=>replace(`/cart/${cart_id}`)}><Icon icon='Clear'/></span>
            Just a couple more things before we can checkout your cart!
          </h1>
          <form onSubmit={_checkout}>
            <ul>
              {
                formData.map((d,i) =>
                  <li key={i}> 
                    <h2>{d.head}</h2>
                    <ul>
                      {
                        d.fields.map((f, j)=>
                          <li key={j}>
                            <p>
                              <input 
                                className={this.state[f.name] && this.state[f.name].modified ? '' : 'empty'} 
                                onChange={(e) => _updateField(e.target.value, f.name)} 
                                placeholder={f.placeholder} 
                                type={f.type} 
                                required={f.required} 
                                autoFocus={f.autofocus}
                                value={this.state[f.name] ? this.state[f.name].val : (f.value || '')}
                              />
                            </p>
                            <p>
                              <label>{f.label}</label>
                            </p>
                          </li>       
                        )
                      }
                    </ul>
                  </li>
                )
              }
              <li><button type='submit'><h4>Checkout</h4></button></li>           
            </ul>
          </form>
        </div>
      </div>
    );
  }
}
