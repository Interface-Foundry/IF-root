import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Field } from 'redux-form'
import { Icon } from '..'

const renderField = ({ input, label, placeholder, handleSubmit, type, meta: { touched, error, warning, submitting, active } }) => (
  <div>
    <label>{label}</label>
    <div className='form__input'>
      <input {...input} placeholder={placeholder} type={type}/>
      <button 
        className='form__input__submit' 
        type="submit"
        onClick={handleSubmit}><p>Submit</p></button>
    </div>
    {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
  </div>
)

export default (props) => {
  const { handleSubmit, cart_id, history: { replace } } = props;

  return (
    <form onSubmit={handleSubmit} className="form">
      <div>
        <Field 
          name="email" 
          type="email"
          label="Whats your Email Address?"
          placeholder="Enter Email"
          handleSubmit={handleSubmit}
          component={renderField}/>
      </div>
      <div className="modal__drag" onClick={() => replace(`/cart/${cart_id}/`)}>
        <Icon icon="Up"/>
      </div>
    </form>
  )
}
