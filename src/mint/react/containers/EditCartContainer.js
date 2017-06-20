// react/containers/EditCartContainer.js

import { connect } from 'react-redux';
import { EditCart } from '../components';
import { updateCart, clearCart, deleteCart, updatePrivacy } from '../actions';

// Ask hannah and add back in, look in Containers.
const mapStateToProps = (state, ownProps) => {
  return {
    cart_id: state.cart.present.id,
    cart: state.cart.present
  };
};

const mapDispatchToProps = dispatch => ({
  updateCart: (newCart) => dispatch(updateCart(newCart)),
  clearCart: (cart_id) => dispatch(clearCart(cart_id)),
  updatePrivacy: (cart_id, privacy) => dispatch(updatePrivacy(cart_id, privacy)),
  deleteCart: (cart_id) => dispatch(deleteCart(cart_id)).then(() => window.location.href = '/newcart')
});

export default connect(mapStateToProps, mapDispatchToProps)(EditCart);
