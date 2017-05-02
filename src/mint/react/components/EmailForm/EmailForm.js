// mint/react/components/EmailForm/EmailForm.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Field } from 'redux-form';

export default class EmailForm extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func,
  }

  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit} className="form">
        <div>
          <Field 
            name="email" 
            type="email"
            label="What's your Email Address?"
            placeholder="Enter Email"
            handleSubmit={handleSubmit}
            component={EmailField}/>
        </div>
      </form>
    );
  }
}

class EmailField extends Component {
  static propTypes = {
    input: PropTypes.object,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    handleSubmit: PropTypes.func,
    type: PropTypes.string,
    meta: PropTypes.object
  }

  render() {
    const { input, label, placeholder, handleSubmit, type, meta: { touched, error, warning } } = this.props;
    return (
      <div>
        <label>{label}</label>
        <div className='form__input email'>
          <input {...input} placeholder={placeholder} type={type}/>
          <button 
            className='form__input__submit' 
            type="submit"
            onClick={handleSubmit}><p>Submit</p></button>
        </div>
        {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
      </div>
    );
  }
}
