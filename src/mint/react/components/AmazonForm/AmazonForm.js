import React, { Component } from 'react';
import { Field } from 'redux-form';
import { DealsContainer } from '../../containers';
import { Icon } from '..';

export default class AmazonForm extends Component {
  constructor(props) {
    super(props);
    this.renderField = ::this.renderField;
  }

  renderField({ input, label, placeholder, handleSubmit, type, meta: { touched, error, warning, submitting, active } }) {
    return (
      <div>
          <label>{label}</label>
          {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
          <div className='form__input'>
            <input {...input} placeholder={placeholder} type={type} autoFocus/>
            <button
              className='form__input__submit'
              type="submit"
              onClick={handleSubmit}><p>Submit</p></button>
          </div>
          <DealsContainer isDropDown={active}/>
        </div>
    );
  }

  render() {
    const { props, renderField } = this;
    const { handleSubmit, cart_id, history: { replace } } = props;
    return (
      <form onSubmit={handleSubmit} className="form">
        <div>
          <Field
            name="url"
            type="string"
            label="Enter URL from Amazon?"
            placeholder="Enter URL"
            handleSubmit={handleSubmit}
            component={renderField}/>
        </div>
        <div className="modal__drag" onClick={() => replace(`/cart/${cart_id}`)}>
          <Icon icon="Up"/>
        </div>
    </form>
    );
  }
}
