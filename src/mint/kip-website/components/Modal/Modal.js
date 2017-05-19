/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../../themes';

export default class Modal extends Component {

  constructor(props) {
    super(props);
    this._enterCode = ::this._enterCode;
    this._enterMail = ::this._enterMail;
    this.state = {
      error: false,
      success: false,
      mail: ''
    };
  }

  static propTypes = {
    _toggleModal: PropTypes.func,
    login: PropTypes.func,
    validateCode: PropTypes.func,
    cart_id: PropTypes.string
  }

  _validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  _enterMail(e) {
    e.preventDefault();
    const { input, _validateEmail, props: { login, cart_id } } = this;

    if (_validateEmail(input.value)) {
      this.setState({ error: null, mail: input.value, success: 'We just sent you a login link to ' + input.value });
      login(cart_id, input.value);
    } else {
      this.setState({ error: 'Invalid email address!' });
    }
  }

  async _enterCode(e) {
    e.preventDefault();
    const {
      state: { mail },
      props: { validateCode, _toggleModal },
      input
    } = this;
    const res = await validateCode(mail, input.value);
    if (res.errors) this.setState({ error: res.errors.message });
    if (res.response && !res.response.ok) this.setState({ error: res.response.message });
    else if (res.response && res.response.ok) _toggleModal();
  }

  render() {
    const { props: { _toggleModal }, state: { error, success }, _enterMail, _enterCode } = this;
    return (
      <section className='modal' onClick={(e) => {if(e.target.className === 'modal') _toggleModal();}}>
        <form className='modal__card' onSubmit={!success ? _enterMail : _enterCode}>
          <div className='modal__card-icon' onClick={() =>  _toggleModal()}>
            <Icon icon='Clear'/>
          </div>
          <h1>{!success ? 'Enter Email to Log In' : 'Ok now enter your code!' }</h1>
          {
            error 
              ? <span style={{color: '#ff6961'}}>{error}</span> 
              : null
          }
          {
            !success 
              ? <input ref={(input) => this.input = input} type='email' required placeholder='Enter your email'/> 
              : <input ref={(input) => this.input = input} type='number' required placeholder='Enter your code'/> 
          }
          <button type='submit'  value='Submit'><Icon icon='Login'/>{!success ? 'Send Login Email' : 'Log In'}</button>
          <div className='modal__description'>
            <p>We will send you a code to automagically log you in</p>
          </div>
        </form>
      </section>
    );
  }
}
