// react/containers/EditCartContainer.js

import { connect } from 'react-redux';
import { EditCart } from '../components';
import { updateCart, clearCart, deleteCart } from '../actions';

// Ask hannah and add back in, look in Containers.
const mapStateToProps = (state, ownProps) => {
  return {
    cart_id: state.cart.id,
    cart: state.cart
  };
};

const mapDispatchToProps = dispatch => ({
  updateCart: (newCart) => dispatch(updateCart(newCart)),
  clearCart: (cart_id) => dispatch(clearCart(cart_id)),
  deleteCart: (cart_id) => dispatch(deleteCart(cart_id))
});

export default connect(mapStateToProps, mapDispatchToProps)(EditCart);
