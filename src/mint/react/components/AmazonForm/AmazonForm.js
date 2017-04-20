import React, { Component } from 'react';
import { Field } from 'redux-form';
import { DealsContainer } from '../../containers';
import SearchHistory from './SearchHistory';

export default class AmazonForm extends Component {
  constructor(props) {
    super(props);
    this.renderField = ::this.renderField;
  }

  onSubmitMiddleware = (values, e, state) => {
    debugger
    const { handleSubmit, onSubmit, cart } = this.props,
        { thumbnail_url } = values;

    if(thumbnail_url && thumbnail_url !== cart.thumbnail_url) {
        cloudinary(thumbnail_url).then((res) => {
            onSubmit({...values, ...cart, thumbnail_url: res.secure_url}, e, state)
        })
    } else {
        onSubmit(values, e, state)
    }
  }

  renderField({ input, label, placeholder, handleSubmit, type, meta: { touched, error, warning, submitting, active } }) {
    return (
      <div>
          <label>
            {label}
          </label>
          <div className='form__input'>
            <input {...input} placeholder={placeholder} type={type} autoFocus autoComplete="off" spellCheck='true'/>
            <button
              className='form__input__submit'
              type="submit"
              onClick={handleSubmit}>
              <p>
                Ok
              </p>
            </button>
          </div>
          <SearchHistory filter={input.value} onChange={input.onChange} handleSubmit={handleSubmit} onSubmitMiddleware={this.onSubmitMiddleware}/>
        </div>
    );
  }

  render() {
    const { props, renderField } = this;
    const { handleSubmit } = props;
    return (
      <form onSubmit={handleSubmit} className="form">
        <Field
          name="url"
          type="string"
          label="Add Item to Kip Cart"
          placeholder="Paste Amazon URL or Search"
          handleSubmit={handleSubmit}
          component={renderField}/>
    </form>
    );
  }
}




          // <DealsContainer isDropdown={active}/>



