// react/components/Feedback/Feedback.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Field } from 'redux-form';
import { Icon } from '..';

export default class Feedback extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func,
  }

  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit} className="form">
      <div>
        <Field 
          name="rating" 
          type="custom"
          placeholder="Enter Email"
          handleSubmit={handleSubmit}
          component={FeedbackField}/>
      </div>
    </form>
    );
  }
}

class FeedbackField extends Component {
  render() {
    const { input: { onChange }, label, placeholder, handleSubmit, type, meta: { touched, error, warning } } = this.props;
    return (
      <div className='feedback'>
        <h1>{label}</h1>
        <ul>
          <li className='col-4' onClick={() => onChange('good')}><Icon icon='Happy'/><h3>Good</h3></li>
          <li className='col-4' onClick={() => onChange('okay')}><Icon icon='Neutral'/><h3>Okay</h3></li>
          <li className='col-4' onClick={() => onChange('bad')}><Icon icon='Sad'/><h3>Bad</h3></li>
        </ul>
        {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
      </div>
    );
  }
}
