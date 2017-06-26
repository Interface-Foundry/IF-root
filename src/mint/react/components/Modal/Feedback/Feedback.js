// react/components/modal/Feedback/Feedback.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from '../../../../react-common/components';

export default class Feedback extends Component {
  constructor(props) {
    super(props);
    this._handleSubmit = ::this._handleSubmit;
    this._setRating = ::this._setRating;
    this._setReview = ::this._setReview;
  }

  static propTypes = {
    handleSubmit: PropTypes.func,
    postFeedback: PropTypes.func,
    cart_id: PropTypes.string
  }

  state = {
    rating: null,
    text: ''
  }

  _handleSubmit = (e) => {
    e.preventDefault()
    const { postFeedback, cart_id } = this.props;

    postFeedback(this.state, cart_id ? cart_id : 'no_cart')
  }

  _setRating = (value) => {
    this.setState({ rating: value });
  }

  _setReview = (value) => {
    this.setState({ text: value });
  }

  render() {
    const { rating } = this.state;
    const { _setRating, _setReview, _handleSubmit } = this;

    return (
      <form onSubmit={_handleSubmit} className="modal__form">
          <div>
            {
              !rating ? <RatingField 
                type="custom"
                label="How do you enjoy Kip?"
                _setRating={_setRating}
              /> : <TextField 
                type="string"
                label="Thank you for using kip!"
                placeholder="Additional Comments"
                _setReview={_setReview}
                _handleSubmit={_handleSubmit}
                {...this.state}
              />
            }
          </div>
      </form>
    );
  }
}

class RatingField extends Component {

  static propTypes = {
    label: PropTypes.string,
    _setRating: PropTypes.func
  }

  render() {
    const { label, _setRating } = this.props;
    return (
      <div className='feedback'>
        <h1>{label}</h1>
        <ul>
          <li className='col-4' onClick={() => { 
            _setRating('good');
          }}>
            <Icon icon='Happy'/>
            <h3>Good</h3>
          </li>
          <li className='col-4' onClick={() => { 
              _setRating('okay');
          }}>
            <Icon icon='Neutral'/>
            <h3>Okay</h3>
          </li>
          <li className='col-4' onClick={() => {
             _setRating('bad');
          }}>
            <Icon icon='Sad'/>
            <h3>Bad</h3>
          </li>
        </ul>
      </div>
    );
  }
}

class TextField extends Component {

  static propTypes = {
    label: PropTypes.string,
    _setReview: PropTypes.func,
    placeholder: PropTypes.string,
    _handleSubmit: PropTypes.func,
    type: PropTypes.string,
    review: PropTypes.string
  }

  render() {
    const { label, review, placeholder, _setReview, _handleSubmit, type } = this.props;

    return (
      <div className='feedback'>
        <h1>{label}</h1>
        <textarea value={review} placeholder={placeholder} type={type} onChange={(e) => _setReview(e.currentTarget.value)}/>
        <button 
          className='form__input__submit' 
          type="submit"
          onClick={_handleSubmit}><Icon icon='Email'/>SEND</button>
      </div>
    );
  }
}
