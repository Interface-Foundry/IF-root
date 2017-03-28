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

const asyncValidate = async(values, dispatch, state) => {
  const { cart_id } = state;
  const { email, url } = values;

  if(!url) {
    const session = await dispatch(signIn(cart_id, email));
    if (!session.newAccount)
      throw { email: 'You\'ve already logged in' }
  }
}

const SignInFormContainer = reduxForm({
  form: 'SignInForm',
  fields: ['email', 'url'],
  validateEmail,
  asyncValidate,
  asyncBlurFields: ['email']
})(SignInForm)

export default connect(mapStateToProps, mapDispatchToProps)(SignInFormContainer)
