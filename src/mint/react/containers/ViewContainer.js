// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { ActionCreators } from 'redux-undo';

import { View } from '../components';
import {
  toggleSidenav,
  togglePopup,
  likeCart,
  unlikeCart,
  cloneCart
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    cart: state.cart.present,
    sidenav: state.app.sidenav,
    popup: state.app.popup,
    tab: state.app.viewTab,
    oldCart: state.cart.past[0]
  };
};

const mapDispatchToProps = dispatch => ({
  togglePopup: () => dispatch(togglePopup()),
  toggleSidenav: () => dispatch(toggleSidenav()),
  likeCart: (id) => dispatch(likeCart(id)),
  unlikeCart: (id) => dispatch(unlikeCart(id)),
  cloneCart: (cart_id) => dispatch(cloneCart(cart_id)),
  undoRemove: (cart, oldCart) => {
    const oldCartSet = new Set(oldCart.items);
    const diff = cart.items.filter(i => !oldCartSet.has(i));
    console.log({ diff });
    dispatch(ActionCreators.undo());
    // dispatch(ActionCreators.clearHistory());
  },
  redoRemove: (cart, oldCart) => {
    dispatch(ActionCreators.redo());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(View);
