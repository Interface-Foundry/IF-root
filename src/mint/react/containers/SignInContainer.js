import { connect } from 'react-redux';
import { SignIn } from '../components';

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
    dispatch(reset('SignIn'))
    dispatch(loggedIn(accounts))
  }
})

const validate = (values, state) => {
  const { anyTouched } = state
  const errors = {};

  if(!anyTouched)
    return errors

  if (!values.email){
    errors.email = 'Required';
  } else if (!isValidEmail(values.email)) {
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

const SignInContainer = reduxForm({
  form: 'SignIn',
  validate,
  asyncValidate,
  shouldAsyncValidate,
  asyncBlurFields: ['email']
})(SignIn)

export default connect(mapStateToProps, mapDispatchToProps)(SignInContainer)
