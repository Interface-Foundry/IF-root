// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import { replace } from 'react-router-redux';

import { View } from '../components';
import {
  toggleSidenav,
  togglePopup,
  likeCart,
  unlikeCart,
  cloneCart,
  addItem,
  fetchMetrics
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    cart: state.cart.present,
    sidenav: state.app.sidenav,
    popup: state.app.popup,
    tab: state.app.viewTab,
    oldCart: state.cart.past,
    showRedo: state.cart.future.length,
    showUndo: state.cart.past.length
  };
};

const mapDispatchToProps = dispatch => ({
  togglePopup: () => dispatch(togglePopup()),
  toggleSidenav: () => dispatch(toggleSidenav()),
  likeCart: (id) => dispatch(likeCart(id)),
  unlikeCart: (id) => dispatch(unlikeCart(id)),
  cloneCart: (cart_id) => dispatch(cloneCart(cart_id)).then(() => {
    dispatch(fetchMetrics(cart_id));
    dispatch(replace(`/cart/${cart_id}?toast=Cart Re-kiped &status=success`));
  }),
  undoRemove: ({ items = [], id: cartId = '' }, cartElder) => {
    const oldItems = cartElder[cartElder.length - 1].items,
      itemsSet = new Set(items),
      reAddedItems = oldItems.filter(i => !itemsSet.has(i));
    dispatch(addItem(cartId, reAddedItems[0].id)).then(() => {
      dispatch(ActionCreators.clearHistory());
    });

  },
  redoRemove: (cart, cartElder) => {
    dispatch(ActionCreators.redo());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(View);
