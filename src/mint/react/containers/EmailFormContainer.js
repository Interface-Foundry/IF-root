// react/containers/EmailFormContainer.js

import { connect } from 'react-redux';
import { reset, reduxForm } from 'redux-form';
import { EmailForm } from '../components';
import ReactGA from 'react-ga';
import { signIn } from '../actions/session';
import { fetchCart, fetchAllCarts } from '../actions/cart';

import { isValidEmail } from '../utils';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  addingItem: state.currentCart.addingItem
});

const mapDispatchToProps = dispatch => ({
  onSubmit: (values, e, state) => dispatch(signIn(state.cart_id, values.email))
    .then(() => {
      const { cart_id } = state;

      ReactGA.event({
        category: 'Sign In',
        action: 'Added Email (from cart)',
      });
      dispatch(fetchCart(cart_id));
      dispatch(fetchAllCarts());
      dispatch(reset('SignIn'));

      // goBack()
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
