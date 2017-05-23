// react/components/Popup/Popup.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '..';

export default class Popup extends Component {

  constructor(props) {
    super(props);
    this._enterCode = ::this._enterCode;
    this._enterMail = ::this._enterMail;
    this.state = {
      error: false,
      success: false,
      mail: { val: '', edited: false },
      code: { val: '', edited: false }
    };
  }

  static propTypes = {
    _togglePopup: PropTypes.func,
    login: PropTypes.func,
    validateCode: PropTypes.func,
    cart_id: PropTypes.string
  }

  _validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  _updateMail = e => this.setState({ mail: { edited: true, val: e.target.value } })
  _updateCode = (e, pos) => {
    const { val } = this.state.code,
      code = String(e.target.value)
      .replace(/[^0-9]/, '');
    if (code.length < 4) this.setState({ code: { edited: true, val: pos ? [val[0], code] : [code, val[1]] } });
    else this.setState({ code: { edited: true, val: [code.substr(0, 3), code.substr(3)] } });

    if (val[0].length === 3) this.refs.code_1.focus();

  }

  _enterMail(e) {
    e.preventDefault();
    const {
      _validateEmail,
      props: { login, cart_id },
      state: { mail: { val: mail } }
    } = this;

    if (_validateEmail(mail)) {
      this.setState({ error: null, success: 'We just sent you a login link to ' + mail });
      login(cart_id, mail);
    } else {
      this.setState({ error: 'Invalid email address!' });
    }
  }

  async _enterCode(e) {
    e.preventDefault();
    const {
      state: { mail: { val: mail }, code: { val: code } },
      props: { validateCode, _togglePopup },
    } = this;
    const res = await validateCode(mail, String(code[0]) + String(code[1]));
    if (res.errors) this.setState({ error: res.errors.message });
    if (res.newSession && !res.newSession.ok) this.setState({ error: res.newSession.message });
    else if (res.newSession && res.newSession.ok) _togglePopup();
  }

  componentWillReceiveProps(nextProps) {
    const { _togglePopup } = this.props;
    const { newAccount } = nextProps;
    if (newAccount) _togglePopup();
  }

  render() {
    const {
      props: { _togglePopup },
      state: { error, success, mail, code },
      _enterMail,
      _enterCode,
      _updateCode,
      _updateMail
    } = this;

    return (
      <section className='popup' onClick={(e) => {if(e.target.className === 'popup') _togglePopup();}}>
        <form className='popup__card' onSubmit={!success ? _enterMail : _enterCode}>
          <div className='popup__card-icon' onClick={() =>  _togglePopup()}>
            <Icon icon='Clear'/>
          </div>
          {
            !success 
            ? <h1>Enter Email to Log In</h1> 
            : <div><h1>I just sent a code to</h1> <h2>{mail.val}</h2></div>
          }
          {
            error 
              ? <span style={{color: '#ff6961'}}>{error}</span> 
              : null
          }
          {
            !success 
              ? <input className={`loginMail ${!mail.edited ? 'empty' : ''}`} onChange={_updateMail} value={mail.val} type='email' required autoFocus placeholder='Enter your email'/> 
              : <div className='autoTab'>
                  <input ref='code_0' className={`loginCode ${!code.edited ? 'empty' : ''}`} onChange={(e) => _updateCode(e, 0)} value={code.val[0]||''} type="tel" pattern='[0-9]{3}' required autoFocus placeholder='000'/>
                  <input ref='code_1' className={`loginCode ${!code.edited ? 'empty' : ''}`} onChange={(e) => _updateCode(e, 1)} value={code.val[1]||''} type="tel" pattern='[0-9]{3}' required placeholder='000'/>
                </div>
          }
          <button type='submit'  value='Submit'><Icon icon='Login'/>{!success ? 'Send Email': 'Log In'}</button>
          {
            !success 
            ? <div className='popup__description'>
                <p>We will send you a code to automagically log you in</p>
              </div>
            : null
          }
        </form>
      </section>
    );
  }
}
