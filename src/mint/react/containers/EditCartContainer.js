// react/containers/EditCartContainer.js

import { connect } from 'react-redux';
import { EditCart } from '../components';
import { getCartById } from '../reducers';
import { updateCart, clearCart, deleteCart, updatePrivacy, privacyLevels } from '../actions/cart';

const mapStateToProps = (state, ownProps) => {
  return {
    prevCartId: state.currentCart.cart_id,
    cart: getCartById(state, { id: ownProps.match.params.edit_cart_id }),
    initialValues: getCartById(state, { id: ownProps.match.params.edit_cart_id }),
    privacyLevels: privacyLevels
  };
};

const mapDispatchToProps = dispatch => ({
  updateCart: (newCart) => dispatch(updateCart(newCart)),
  updatePrivacy: (cart_id, privacyLevel) => dispatch(updatePrivacy(cart_id, privacyLevel)),
  clearCart: (cart_id) => dispatch(clearCart(cart_id)),
  deleteCart: (cart_id) => dispatch(deleteCart(cart_id))
});

export default connect(mapStateToProps, mapDispatchToProps)(EditCart);
