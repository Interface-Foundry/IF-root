import { connect } from 'react-redux';
import { LoginScreen } from '../../react-common/components';

import {
  get,
  togglePopup,
  login,
  validateCode
} from '../actions';

const mapStateToProps = (state, props) => ({
  user: state.user,
  newAccount: state.session.newAccount,
  status: state.session.status,
  errors: state.session.errors,
  message: state.session.message,
  ok: state.session.ok,
  loggedIn: state.session.loggedIn
});

const mapDispatchToProps = dispatch => ({
  login: (cart_id, email) => dispatch(login(cart_id, email)),
  validateCode: (email, code) => dispatch(validateCode(email, code)),
  get: (url, type) => dispatch(get(url, type)),
  _toggleLoginScreen: () => dispatch(togglePopup())
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
