// react/components/modal/Feedback/Feedback.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Field } from 'redux-form';
import { Icon } from '../../../../react-common/components';

export default class Feedback extends Component {
  constructor(props) {
    super(props);
    this._toggleRating = ::this._toggleRating;
  }

  static propTypes = {
    handleSubmit: PropTypes.func
  }

  state = {
    rating: true
  }

  _toggleRating = (value) => {
    this.setState({ rating: value || !this.state.rating });
  }

  render() {
    const { handleSubmit } = this.props;
    const { rating } = this.state;
    const { _toggleRating } = this;

    return (
      <form onSubmit={handleSubmit} className="modal__form">
          <div>
            {
              rating ? <Field 
                name="rating" 
                type="custom"
                label="How do you enjoy Kip?"
                _toggleRating={_toggleRating}
                handleSubmit={handleSubmit}
                component={RatingField}
              /> : <Field 
                name="text" 
                type="string"
                label="Thank you for using kip!"
                placeholder="Additional Comments"
                handleSubmit={handleSubmit}
                component={TextField}
              />
            }
          </div>
      </form>
    );
  }
}

class RatingField extends Component {

  static propTypes = {
    input: PropTypes.object,
    label: PropTypes.string,
    meta: PropTypes.object,
    _toggleRating: PropTypes.func
  }

  render() {
    const { input: { onChange }, label, meta: { touched, error, warning }, _toggleRating } = this.props;
    return (
      <div className='feedback'>
        <h1>{label}</h1>
        <ul>
          <li className='col-4' onClick={() => { 
            onChange('good');
            _toggleRating(false);
          }}>
            <Icon icon='Happy'/>
            <h3>Good</h3>
          </li>
          <li className='col-4' onClick={() => { 
              onChange('okay');
              _toggleRating(false);
          }}>
            <Icon icon='Neutral'/>
            <h3>Okay</h3>
          </li>
          <li className='col-4' onClick={() => {
             onChange('bad');
             _toggleRating(false);
          }}>
            <Icon icon='Sad'/>
            <h3>Bad</h3>
          </li>
        </ul>
        {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
      </div>
    );
  }
}

class TextField extends Component {

  static propTypes = {
    input: PropTypes.object,
    label: PropTypes.string,
    meta: PropTypes.object,
    _toggleRating: PropTypes.func,
    placeholder: PropTypes.string,
    handleSubmit: PropTypes.func,
    type: PropTypes.string
  }

  render() {
    const { input, label, placeholder, handleSubmit, type, meta: { touched, error, warning } } = this.props;

    return (
      <div className='feedback'>
        <h1>{label}</h1>
        <textarea {...input} placeholder={placeholder} type={type}/>
        <button 
          className='form__input__submit' 
          type="submit"
          onClick={handleSubmit}><Icon icon='Email'/>SEND</button>
        {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
      </div>
    );
  }
}
