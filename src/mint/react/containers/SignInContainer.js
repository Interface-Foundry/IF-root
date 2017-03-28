import { connect } from 'react-redux';
import { SignInForm } from '../components';

import { signIn, loggedIn } from '../actions/session';

import { reduxForm, reset } from 'redux-form';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id
})

const mapDispatchToProps = dispatch => ({
  onSubmit: (values, e, state) => {
    const { email, url } = values;
    const { cart_id } = state;

    dispatch(addItem(cart_id, url))
    dispatch(reset('SignInForm'))
    dispatch(loggedIn())
  }
})

const validateEmail = values => {
  const errors = {};
  if (!values.email) {
    errors.email = 'Required';
  }
  return errors;
}

const asyncValidate = (values, dispatch, state) =>
  dispatch(signIn(state.cart_id, values.email))
  .then(session => {
    if (!session.newAccount) {
      throw { email: 'You\'ve logged in already' }
    }
    return session.newAccount
  });

const SignInFormContainer = reduxForm({
  form: 'SignInForm',
  validateEmail,
  asyncValidate,
  asyncBlurFields: ['email']
})(SignInForm)

export default connect(mapStateToProps, mapDispatchToProps)(SignInFormContainer)