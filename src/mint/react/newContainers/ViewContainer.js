// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { View } from '../newComponents';

import {
  toggleSidenav,
  togglePopup,
  likeCart,
  unlikeCart
} from '../newActions';

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    cart: state.cart,
    sidenav: state.app.sidenav,
    popup: state.app.popup,
    tab: state.app.viewTab
  };
};

const mapDispatchToProps = dispatch => ({
  togglePopup: () => dispatch(togglePopup()),
  toggleSidenav: () => dispatch(toggleSidenav()),
  likeCart: (id) => dispatch(likeCart(id)),
  unlikeCart: (id) => dispatch(unlikeCart(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(View);
