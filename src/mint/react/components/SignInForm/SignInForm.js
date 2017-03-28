import React, { Component, PropTypes } from 'react';
import { Field } from 'redux-form';

export default class SignIn extends Component {
  render() {
    const { handleSubmit } = this.props;
    return (
      <form className="signIn" onSubmit={handleSubmit}> 
        <div className="input">
          <label htmlFor="email">Paste URL from Amazon</label>
          <Field name="email" component="input" type="email" placeholder='Enter your email'/>
        </div>
        <button className="submit" type="submit">Submit</button>
      </form>
    );
  }
}

