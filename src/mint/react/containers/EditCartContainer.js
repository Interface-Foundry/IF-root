// react/containers/EditCartContainer.js

import { connect } from 'react-redux';
import { reset, reduxForm } from 'redux-form';
import ReactGA from 'react-ga';
import { EditCart } from '../components';
import { getCartById } from '../reducers';
import { updateCart } from '../actions/cart';

const mapStateToProps = (state, ownProps) => {
  return {
    cart_id: state.currentCart.cart_id,
    cart: getCartById(state, { id: ownProps.match.params.edit_cart_id }),
    initialValues: getCartById(state, { id: ownProps.match.params.edit_cart_id })
  };
};

const mapDispatchToProps = dispatch => ({
  // We need to edit the cart here
  onSubmit: (values, e, state) => dispatch(updateCart(values))
    .then(() => {
      ReactGA.event({
        category: 'Cart',
        action: 'Cart edited!',
      });
      const { history: { push }, cart_id } = state;
      dispatch(reset('SignIn'));
      push(`/cart/${cart_id}?toast=Cart Updated! 😊&status=success`);
    })
});

const validate = (values, state) => {
  const errors = {};

  return errors;
};

const EditCartContainer = reduxForm({
  form: 'EditCart',
  validate
})(EditCart);

export default connect(mapStateToProps, mapDispatchToProps)(EditCartContainer);
