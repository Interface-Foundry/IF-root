// react/containers/EditCartContainer.js

import { connect } from 'react-redux';
import { EditCart } from '../newComponents';
import { getCartById } from '../newReducers';
import { updateCart, clearCart, deleteCart } from '../newActions';

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
