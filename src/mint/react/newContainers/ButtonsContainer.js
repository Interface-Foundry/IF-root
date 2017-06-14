import { connect } from 'react-redux';
import { Buttons } from '../newComponents';
import { push } from 'react-router-redux';

import {
  toggleModal,
  updateCart,
  reorderCart
} from '../newActions';

const mapStateToProps = (state, props) => {
  return {
    cart: state.cart,
    user: state.user
  };
};

const mapDispatchToProps = dispatch => ({
  _toggleLoginScreen: () => dispatch(toggleModal()),
  reorderCart: (id) => dispatch(reorderCart(id)),
  push: (url) => dispatch(push(url)),
  updateCart: (cart) => dispatch(updateCart(cart))
});

export default connect(mapStateToProps, mapDispatchToProps)(Buttons);
