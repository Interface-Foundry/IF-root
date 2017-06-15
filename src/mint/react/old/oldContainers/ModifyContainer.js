// react/containers/ModifyContainer.js
// if possible merge into new footer container

import { connect } from 'react-redux';
import { updateItem, removeItem } from '../actions/item';
import { ModifyFooter } from '../components';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  item_id: state.item.id,
  old_item_id: state.item.old_item_id,
  new_item_id: state.item.id
});

const mapDispatchToProps = dispatch => ({
  updateItem: (cart_id, old_item_id, new_item_id) => dispatch(updateItem(cart_id, old_item_id, new_item_id)),
  removeItem: (cart_id, item_id) => dispatch(removeItem(cart_id, item_id))
});

export default connect(mapStateToProps, mapDispatchToProps)(ModifyFooter);