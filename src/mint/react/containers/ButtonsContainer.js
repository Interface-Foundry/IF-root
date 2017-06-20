import { connect } from 'react-redux';
import { Buttons } from '../components';
import { push } from 'react-router-redux';

import {
  togglePopup,
  updateCart,
  reorderCart
} from '../actions';

const mapStateToProps = (state, props) => {
  return {
    cart: state.cart.present,
    user: state.user
  };
};

const mapDispatchToProps = dispatch => ({
  _toggleLoginScreen: () => dispatch(togglePopup()),
  reorderCart: (id) => dispatch(reorderCart(id)),
  push: (url) => dispatch(push(url)),
  updateCart: (cart) => dispatch(updateCart(cart))
});

export default connect(mapStateToProps, mapDispatchToProps)(Buttons);
