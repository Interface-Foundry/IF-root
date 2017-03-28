import { connect } from 'react-redux';
import { SignInForm } from '../components';

import { signIn } from '../actions/session';

import { reduxForm, reset } from 'redux-form';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  session: state.session
})

const mapDispatchToProps = dispatch => ({
  onSubmit: (values, e, state) => {
    const { email } = values;
    const { cart_id } = state;

    dispatch(signIn(cart_id, email))
    dispatch(reset('SignInForm'))
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
  const { email } = values;
  const session = await dispatch(signIn(cart_id, email));
  if (!session.newSession)
    throw { email: 'You\'ve already logged in' }
}

const SignInFormContainer = reduxForm({
  form: 'SignInForm',
  validateEmail,
  asyncValidate,
  asyncBlurFields: ['email']
})(SignInForm)

export default connect(mapStateToProps, mapDispatchToProps)(SignInFormContainer)
