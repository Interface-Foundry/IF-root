import { connect } from 'react-redux';
import { LoginScreen } from '../../react-common/components';

import {
  get,
  togglePopup,
  login,
  validateCode,
  fetchCarts
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
  get: (url, type) => dispatch(get(url, type)),
  _toggleLoginScreen: () => dispatch(togglePopup()),
  login: (cart_id, email) => dispatch(login(cart_id, email)).then(() => {
    dispatch(fetchCarts());
  }),
  validateCode: (email, code) => dispatch(validateCode(email, code)).then(() => {
    dispatch(fetchCarts());
  })
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
