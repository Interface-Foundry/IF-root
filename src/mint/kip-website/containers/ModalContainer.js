import { connect } from 'react-redux';
import { LoginScreen } from '../../react-common/components';

import {
  get,
  toggleModal,
  login,
  validateCode
} from '../actions';

const mapStateToProps = (state, props) => ({
  user_account: state.auth.user_account,
  newAccount: state.auth.newAccount,
  status: state.auth.status,
  errors: state.auth.errors,
  message: state.auth.message,
  ok: state.auth.ok,
  loggedIn: state.auth.loggedIn,
  loginText: state.app.loginText,
  loginSubtext: state.app.loginSubtext,
  src: sessionStorage.src || state.siteState.src
});

const mapDispatchToProps = dispatch => ({
  login: (cart_id, email) => dispatch(login(cart_id, email)),
  validateCode: (email, code) => dispatch(validateCode(email, code)),
  get: (url, type) => dispatch(get(url, type)),
  _toggleLoginScreen: () => dispatch(toggleModal())
})

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
