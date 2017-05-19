// react/containers/AddAmazonItemContainer.js

import { connect } from 'react-redux';
import { addingItem } from '../actions/cart';
import { AddAmazonItem } from '../components';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  storeName: state.currentCart.store || '',
  numUserItems: state.session.user_account.id ? state.currentCart.items.filter(item =>
      (item.added_by === state.session.user_account.id))
    .length : 0,
  user_account: state.session.user_account
});

const mapDispatchToProps = dispatch => ({
  addingItem: (bool) => {
    ReactGA.event({
      category: 'Cart',
      action: 'Item Added',
    });
    return dispatch(addingItem(bool));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(AddAmazonItem);
