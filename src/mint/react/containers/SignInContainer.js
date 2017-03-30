import { connect } from 'react-redux';
import { SignIn } from '../components';

import { changeKipFormView } from '../actions/kipForm';

import { signIn } from '../actions/session';
 
import { isValidEmail } from '../utils';

import { addItem, fetchCart } from '../actions/cart';

import { reduxForm, reset } from 'redux-form';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  accounts: state.session.user_accounts,
  animation: state.kipForm.animation,
  showSiblings: state.kipForm.showSiblings,
  currentView: state.kipForm.currentView,
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
    dispatch(fetchCart(cart_id))
    dispatch(reset('SignIn'))
  },
  changeKipFormView: (viewInt) => changeKipFormView(viewInt)
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
    if (!session.newSession.newAccount) {
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
