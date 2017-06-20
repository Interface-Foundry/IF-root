// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { ActionCreators } from 'redux-undo';

import { View } from '../components';
import {
  toggleSidenav,
  togglePopup,
  likeCart,
  unlikeCart,
  cloneCart,
  addItem
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    cart: state.cart.present,
    sidenav: state.app.sidenav,
    popup: state.app.popup,
    tab: state.app.viewTab,
    oldCart: state.cart.past[0],
    showRedo: state.cart.future.length,
    showUndo: state.cart.past.length
  };
};

const mapDispatchToProps = dispatch => ({
  togglePopup: () => dispatch(togglePopup()),
  toggleSidenav: () => dispatch(toggleSidenav()),
  likeCart: (id) => dispatch(likeCart(id)),
  unlikeCart: (id) => dispatch(unlikeCart(id)),
  cloneCart: (cart_id) => dispatch(cloneCart(cart_id)),
  undoRemove: ({ items = [], id: cartId = '' }, { items: oldItems = [] }) => {
    const oldItemsSet = new Set(oldItems),
      reAddedItems = items.filter(i => !oldItemsSet.has(i));
      console.log({oldItems, items, reAddedItems})
    dispatch(addItem(cartId, reAddedItems[0].id)).then(() => {
      // dispatch(ActionCreators.undo());
      dispatch(ActionCreators.clearHistory());
    });

  },
  redoRemove: (cart, oldCart) => {
    dispatch(ActionCreators.redo());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(View);
