import React, { Component, PropTypes } from 'react';
import { Field } from 'redux-form';

import InputWithButton from './InputWithButton'

export default class SignIn extends Component {
  render() {
    const { handleSubmit } = this.props;
    return (
      <div className="modal">
        <form className="signIn" onSubmit={handleSubmit}> 
          <h1>Start New Group Cart</h1>
          <div className="signIn__input">
            <label  htmlFor="email">1. Whats your Email Address</label>
            <Field name="email" component={InputWithButton}/>
          </div>
        </form>
      </div>
    );
  }
}

