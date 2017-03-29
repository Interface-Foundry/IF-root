import { connect } from 'react-redux';
import { SignInForm } from '../components';

import { signIn, loggedIn } from '../actions/session';

import { isValidEmail } from '../utils';

import { addItem } from '../actions/cart';

import { reduxForm, reset } from 'redux-form';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  newAccount: state.session.newAccount,
  accounts: state.session.user_accounts,
  initialValues: {
    email: '',
    url: ''
  }
})

const mapDispatchToProps = dispatch => ({
  onSubmit: (values, e, state) => {
    const { email, url } = values;
    const { cart_id, accounts } = state;

    dispatch(addItem(cart_id, url))
    dispatch(reset('SignInForm'))
    dispatch(loggedIn(accounts))
  }
})

const validate = (values, state) => {
  const errors = {};
  if (!values.email) {
    errors.email = 'Required';
  }
  if (!isValidEmail(values.email)) {
    errors.email = 'Invalid email address';
  }
  return errors;
}

const asyncValidate = (values, dispatch, state) =>
  dispatch(signIn(state.cart_id, values.email))
  .then(session => {
    if (!session.newAccount) {
      dispatch(loggedIn(state.accounts))
      throw { email: 'You\'ve logged in already' }
    }
    return session.newAccount
  });

const shouldAsyncValidate = (params) => params.trigger === 'blur' && params.syncValidationPasses;

const SignInFormContainer = reduxForm({
  form: 'SignInForm',
  validate,
  asyncValidate,
  shouldAsyncValidate,
  asyncBlurFields: ['email']
})(SignInForm)

export default connect(mapStateToProps, mapDispatchToProps)(SignInFormContainer)
