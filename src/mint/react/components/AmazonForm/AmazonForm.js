import React, { Component, PropTypes } from 'react';
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
  const { handleSubmit } = props
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
    </form>
  )
}


