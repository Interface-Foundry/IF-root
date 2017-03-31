import { connect } from 'react-redux';
import { SignIn } from '../components';

import { changeKipFormView } from '../actions/kipForm';

import { signIn, toggleAddingToCart } from '../actions/session';

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
});

const mapDispatchToProps = dispatch => ({
  onSubmit: (values, e, state) => {
    const { url } = values;
    const { cart_id } = state;

    dispatch(addItem(cart_id, url));
    dispatch(fetchCart(cart_id));
    dispatch(toggleAddingToCart());
    dispatch(reset('SignIn'));
  },
  changeKipFormView: (viewInt) => {
    dispatch(toggleAddingToCart());
    dispatch(changeKipFormView(viewInt));
  }
});

const validate = (values, state) => {
  const errors = {};
  if (!values.email && state.currentView < 2) {
    errors.email = 'Required';
  } else if (!isValidEmail(values.email) && state.currentView < 2) {
    errors.email = 'Invalid email address';
  }

  return errors;
};

const asyncValidate = (values, dispatch, state) =>
  dispatch(signIn(state.cart_id, values.email))
  .then(session => {
    if (!session.newSession.newAccount) {
      throw { email: 'You\'ve logged in already' };
    }
    return session.newAccount;
  })
  .catch(error => {
    // currently this reroutes you to the email overlay, but kept this in case we want to do some error handling
  });

const shouldAsyncValidate = (params) => params.trigger === 'blur' && params.syncValidationPasses;

const SignInContainer = reduxForm({
  form: 'SignIn',
  validate,
  asyncValidate,
  shouldAsyncValidate,
  asyncBlurFields: ['email']
})(SignIn);

export default connect(mapStateToProps, mapDispatchToProps)(SignInContainer);
