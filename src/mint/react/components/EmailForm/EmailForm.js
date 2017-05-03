// mint/react/components/EmailForm/EmailForm.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Field } from 'redux-form';
import { Icon } from '..';

export default class EmailForm extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func,
  }

  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit} className="modal__form">
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
        <div className='form__modal__input email'>
          <input {...input} placeholder={placeholder} type={type}/>
          <button 
            className='form__modal__input__submit' 
            type="submit"
            onClick={handleSubmit}>
              <div className='form__modal__input__submit__description'>
                <Icon icon='RightChevron'/>
              </div>
          </button>
        </div>
        {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
      </div>
    );
  }
}
