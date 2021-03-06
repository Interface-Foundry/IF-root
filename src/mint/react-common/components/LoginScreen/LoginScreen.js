// react/components/Popup/Popup.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '..';
import { Right } from '../../../kip-website/themes/newSvg';

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
    newAccount: PropTypes.bool,
    ok: PropTypes.bool,
    status: PropTypes.string,
    loggedIn: PropTypes.bool,
    message: PropTypes.string,
    cart_id: PropTypes.string,
    errors: PropTypes.array,
    login: PropTypes.func,
    validateCode: PropTypes.func,
    loginText: PropTypes.string,
    loginSubtext: PropTypes.string,
    _toggleLoginScreen: PropTypes.func
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

    if (val && val[0].length === 3) this.code_1.focus();

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
      props: { validateCode }
    } = this;
    await validateCode(mail, String(code[0]) + String(code[1]));
  }

  componentWillReceiveProps(nextProps) {
    const { _toggleLoginScreen, newAccount } = this.props;
    const { newAccount: nextNewAccount, errors, ok, message, status } = nextProps;
    if (nextNewAccount && nextNewAccount !== newAccount) _toggleLoginScreen();
    if (errors) this.setState({ error: errors.message });
    if (!ok) this.setState({ error: message });
    else if (status === 'LOG_IN' && ok) _toggleLoginScreen();
  }

  render() {
    const {
      props: { _toggleLoginScreen, loginText = 'Enter Email to Sign Up', loginSubtext = '' },
      state: { error, success, mail, code },
      _enterMail,
      _enterCode,
      _updateCode,
      _updateMail
    } = this;

    return (
      <section className='popup' onClick={(e) => {if(e.target.className === 'popup' && !window.location.href.includes('newcart')) _toggleLoginScreen();}}>
        <form className={`popup__card ${success ? 'codemode':''}`} onSubmit={!success ? _enterMail : _enterCode}>

          {
            window.location.href.includes('newcart')
            ? null
            : (<div className='popup__card-icon' onClick={() =>  _toggleLoginScreen()}>
                <Icon icon='Clear'/>
              </div>)
          }
          {
            !success
            ? <h1>{ loginText }</h1>
            : <div><h1>I just sent a code to</h1> <h2>{mail.val}</h2></div>
          }
          {
            error
              ? <span className='error-msg'>{error}</span>
              : null
          }
          {
            !success
              ? <div className='popup__card__login_fields'>
                  <a className='popup__card__login_button' href='/api/auth/facebook'>
                    <img src='//storage.googleapis.com/kip-random/website/login_with_fbook.png'/>
                  </a>
                  <input className={`loginMail ${!mail.edited ? 'empty' : ''}`} onChange={_updateMail} value={mail.val} type='email' required autoFocus placeholder='Enter your email'/>
                </div>
              : <div className='autoTab'>
                  <input ref={(c) => { this.code_0 = c; }} className={`loginCode ${!code.edited ? 'empty' : ''}`} onChange={(e) => _updateCode(e, 0)} value={code.val[0]||''} type="tel" pattern='[0-9]{3}' required autoFocus placeholder='000'/>
                  <input ref={(c) => { this.code_1 = c; }} className={`loginCode ${!code.edited ? 'empty' : ''}`} onChange={(e) => _updateCode(e, 1)} value={code.val[1]||''} type="tel" pattern='[0-9]{3}' required placeholder='000'/>
                </div>
          }

          <button type='submit'  value='Submit'>{!success ? 'Sign Up ': 'Log In '} <Right/></button>
          {
            !success
            ? <div className='popup__description'>
                <p>{loginSubtext}</p>
              </div>
            : null
          }
        </form>
      </section>
    );
  }
}
