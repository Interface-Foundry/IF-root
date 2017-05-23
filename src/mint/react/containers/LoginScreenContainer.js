import { connect } from 'react-redux';
import { LoginScreen } from '../../react-common/Components';

import { login, validateCode } from '../actions/session';

const mapStateToProps = (state, props) => ({
  user_account: state.session.user_account,
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
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
