import { connect } from 'react-redux';
import Modal from '../components/Modal';

import { login, validateCode } from '../actions';

const mapStateToProps = (state, props) => ({
  user_account: state.auth.user_account,
  newAccount: state.auth.newAccount
});

const mapDispatchToProps = dispatch => ({
  login: (cart_id, email) => dispatch(login(cart_id, email)),
  validateCode: (email, code) => dispatch(validateCode(email, code)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Modal);
