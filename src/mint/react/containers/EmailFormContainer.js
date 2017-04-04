import { connect } from 'react-redux';
import { reset } from 'redux-form'

import { EmailForm } from '../components';

import { signIn } from '../actions/session';
import { fetchCart } from '../actions/cart';

import { isValidEmail } from '../utils';

import { reduxForm } from 'redux-form';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  addingItem: state.cart.addingItem
});

const mapDispatchToProps = dispatch => ({
  onSubmit: (values, e, state) => dispatch(signIn(state.cart_id, values.email)).then(() => {
      const { history: { replace }, cart_id, addingItem } = state;   
      dispatch(fetchCart(cart_id));
      dispatch(reset('SignIn'));

      addingItem
        ? replace(`/cart/${cart_id}/m/item/add`)
        : replace(`/cart/${cart_id}`);
    })
});

const validate = (values, state) => {
  const errors = {};
  if (!values.email) {
    errors.email = 'Required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Invalid email address';
  }

  return errors;
};

const EmailFormContainer = reduxForm({
  form: 'SignIn',
  validate
})(EmailForm);

export default connect(mapStateToProps, mapDispatchToProps)(EmailFormContainer);

// In case we want asyncValidation
// const asyncValidate = (values, dispatch, state) =>
//   dispatch(signIn(state.cart_id, values.email))
//   .then(session => {
//     if (!session.newSession.newAccount) {
//       throw { email: 'You\'ve logged in already' };
//     }
//     return session.newAccount;
//   })
//   .catch(error => {
//     // currently this reroutes you to the email overlay, but kept this in case we want to do some error handling
//   });

// const shouldAsyncValidate = (params) => params.trigger === 'blur' && params.syncValidationPasses;
